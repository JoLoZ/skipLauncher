const { dialog, app } = require("electron");

var win = null;

exports.launch = function (mc_version, auth, mainWindow) {
  win = mainWindow;

  const path = require("path");
  const { Client, Authenticator } = require("minecraft-launcher-core");

  const launcher = new Client();

  let opts = {
    clientPackage: null,
    authorization: auth,
    root: "./minecraft",
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

  mainWindow.webContents.send("launch_msg", {
    data: "Launching...",
    percent: 100,
  });
  launcher.launch(opts).then(() => {
    setTimeout(() => {
      mainWindow.close();
    }, 500);
  });

  launcher.on("debug", (e) => console.log(e));
  launcher.on("data", (e) => {
    console.log(e);
    if (e.includes("Stopping!")) {
      console.log("Stop detected! Shutting down...");
      app.quit();
    }
  });
};

exports.login = {};

exports.login.ms = function (
  mainWindow,
  options,
  callback,
  errCallback = console.error
) {
  win = mainWindow;

  console.log("Login Options", options);

  const msmc = require("msmc");

  if (options.launch) {
    mainWindow.loadFile("launch.html");
  }
  mainWindow.setAlwaysOnTop(true, "main-menu");

  var sentCallback = false;

  msmc
    .fastLaunch(
      "electron",
      (update) => {
        mainWindow.setAlwaysOnTop(false);
        //A hook for catching loading bar events and errors, standard with MSMC
        console.log("CallBack!!!!!");
        console.log(update);
        if (!sentCallback && !options.full) {
          console.log("Sending login callback");
          callback(true);
          sentCallback = true;
        } else if (!options.full) {
          console.log("Ignoring");
        } else {
          mainWindow.webContents.send("launch_msg", update);
        }
      },
      options.visual
    )
    .then((result) => {
      mainWindow.setAlwaysOnTop(false);
      //Let's check if we logged in?
      if (msmc.errorCheck(result)) {
        handleError(result.reason, errCallback);
        return;
      }
      if (options.launch) {
        exports.launch(
          options.version,
          msmc.getMCLC().getAuth(result),
          mainWindow
        );
      } else {
        callback(msmc.getMCLC().getAuth(result));
      }
    })
    .catch((reason) => {
      handleError(reason, errCallback);
    });
};

function handleError(reason, callback) {
  win.setAlwaysOnTop(false);
  callback(reason);
}
