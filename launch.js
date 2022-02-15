const { dialog, app, ipcMain } = require("electron");
var logger = require("logger").createLogger("latest.log");
logger.format = require("./loggerFunc").format;

logger.setLevel("debug");

var win = null;

exports.launch = function (mc_version, auth, mainWindow, exitCallback) {
  win = mainWindow;

  const path = require("path");
  const { Client, Authenticator } = require("minecraft-launcher-core");
  const fs = require("fs");

  if(!fs.existsSync("./minecraft")){
    fs.mkdirSync("./minecraft");
  }

  exports.syncFiles(process.env.APPDATA + "/.minecraft", "./minecraft", (msg) => {
    mainWindow.webContents.send("launch_msg", msg);
  });

  mainWindow.webContents.send("launch_msg", "Preparing launch...");

  const launcher = new Client();

  let opts = {
    clientPackage: null,
    authorization: auth,
    overwrites: {
      directory: "..",
      gameDirectory: "..",
    },
    root: "minecraft",
    version: {
      number: mc_version,
      type: "release",
    },
    memory: {
      max: "6G",
      min: "4G",
    },
    detached: true,
  };

  console.log("Starting!");

  launcher.launch(opts).then((instance) => {
    setTimeout(() => {
      mainWindow.close();
    }, 500);

    instance.on("error", (err) => {
      dialog
        .showMessageBox({
          message:
            "There was an error running Minecraft. Please check the log for further info.",
          title: "Error",
          type: "error",
        })
        .then(app.quit);
    });

    instance.on("close", (code) => {
      exitCallback(code);
    })
  });

  launcher.on("data", sendLogToWindow);
  launcher.on("debug", sendLogToWindow);

  function sendLogToWindow(e) {
    logger.info(e);
    try {
      mainWindow.webContents.send("launch_msg", e);
    } catch {}
  }
};

exports.login = async (win, options) => {
  logger.debug("Login requested", options);
  const msmc = require("msmc");

  if(options.errorHandler == undefined){
    options.errorHandler = function(reason){
      logger.error("[AUTH] ERR", reason);
    }
  }

  msmc
    .fastLaunch(
      "electron",
      (update) => {
        logger.info("[AUTH]", update.data);
        win.webContents.send("login_update", update);
      },
      options.visible,
      options.window
    )
    .then((result) => {
      //Let's check if we logged in?
      if (msmc.errorCheck(result)) {
        options.errorHandler(result.reason);
        return
      }

      win.webContents.send("login_result", msmc.getMCLC().getAuth(result));
    }).catch(options.errorHandler);
};

exports.syncFiles = function (source, dest, progressCB, exitWindow) {
  const fs = require("fs");
  const path = require("path");

  if(progressCB == "exit"){
    progressCB = (msg) => {
      logger.info("[EXIT] File sync progress: \n", msg)
      exitWindow.webContents.send("exit_msg", msg);
    }
  }


  if(!fs.existsSync(source) && !fs.existsSync(dest)){
    progressCB("No local Minecraft installation found.\nSkipping...")
    return;
  }


  function copyFileSync(source, target) {
    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  }

  function copyFolderRecursiveSync(source, target, action) {
    var files = [];

    // Check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder);
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
      files = fs.readdirSync(source);
      files.forEach(function (file) {
        if (action != undefined) {
          progressCB(action + "\n" + file);
        }

        var curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          copyFolderRecursiveSync(curSource, targetFolder);
        } else {
          copyFileSync(curSource, targetFolder);
        }
      });
    }
  }

  copyFolderRecursiveSync(source + "/saves", dest, "Copying worlds...");

  copyFolderRecursiveSync(
    source + "/resourcepacks",
    dest,
    "Copying resource packs..."
  );

  progressCB("Copying configuration...");
  fs.copyFileSync(source + "/options.txt", dest + "/options.txt");
  progressCB("Copying servers...");
  fs.copyFileSync(source + "/servers.dat", dest + "/servers.dat");
};
