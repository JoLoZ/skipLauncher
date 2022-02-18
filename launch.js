const { dialog, app, ipcMain } = require("electron");
const config = require("./config");

var win = null;

exports.launch = function (mc_version, auth, mainWindow, exitCallback, loc) {
  win = mainWindow;

  const path = require("path");
  const { Client, Authenticator } = require("minecraft-launcher-core");
  const fs = require("fs");

  console.info("Attempting to launch in", loc);

  if (!fs.existsSync(loc)) {
    fs.mkdirSync(loc);
  }

  exports.syncFiles(process.env.APPDATA + "/.minecraft", loc, (msg) => {
    mainWindow.webContents.send("launch_msg", msg);
  });

  mainWindow.webContents.send("launch_msg", "Preparing launch...");

  const launcher = new Client();

  let opts = {
    clientPackage: null,
    authorization: auth,
    root: loc,
    version: {
      number: mc_version.number,
      type: mc_version.type,
    },
    memory: {
      max: config.get("memory_max", "6G"),
      min: config.get("memory_min", "4G"),
    },
    detached: true,
  };

  console.log("Starting!");

  launcher.on("progress", (progress) => {
    console.log("Progress", progress);
    mainWindow.webContents.send("launch_progress", progress);
  });

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
    });
  });

  launcher.on("data", sendLogToWindow);
  launcher.on("debug", sendLogToWindow);

  function sendLogToWindow(e) {
    console.info(e);
    try {
      mainWindow.webContents.send("launch_msg", e);
    } catch {}
  }
};

exports.login = async (win, options) => {
  console.log("Login requested", options);
  const msmc = require("msmc");

  if (options.errorHandler == undefined) {
    options.errorHandler = function (reason) {
      console.error("[AUTH] ERR", reason);
    };
  }

  msmc
    .fastLaunch(
      "electron",
      (update) => {
        console.info("[AUTH]", update.data);
        win.webContents.send("login_update", update);
      },
      options.visible,
      options.window
    )
    .then((result) => {
      //Let's check if we logged in?
      if (msmc.errorCheck(result)) {
        options.errorHandler(result.reason);
        return;
      }

      console.log("[AUTH]", result);
      win.webContents.send("login_result", {
        auth: msmc.getMCLC().getAuth(result),
        profile: result.profile,
      });
    })
    .catch(options.errorHandler);
};

exports.syncFiles = function (source, dest, progressCB, exitWindow) {
  const fs = require("fs");
  const path = require("path");

  if (!config.get("syncFiles", true)) {
    return;
  }

  if (progressCB == "exit") {
    progressCB = (msg) => {
      console.info("[EXIT] File sync progress: \n", msg);
      exitWindow.webContents.send("exit_msg", msg);
    };
  }

  if (!fs.existsSync(source) && !fs.existsSync(dest)) {
    progressCB("No local Minecraft installation found.\nSkipping...");
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
