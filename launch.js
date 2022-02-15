const { dialog, app, ipcMain } = require("electron");
var logger = require("logger").createLogger("latest.log");
logger.format = require("./loggerFunc").format;

logger.setLevel("debug");

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

  launcher.launch(opts).then(() => {
    setTimeout(() => {
      mainWindow.close();
    }, 500);
  });

  launcher.on("data", sendLogToWindow);
  launcher.on("debug", sendLogToWindow);

  function sendLogToWindow(e) {
    logger.info(e);
    try {
      mainWindow.webContents.send("launch_msg", e);
    } catch {}
    if (e.includes("Stopping!")) {
      logger.debug("Stop detected! Shutting down...");
      app.quit();
    }
  }
};

exports.login = (win, options) => {
  logger.debug("Login requested", options);
  const msmc = require("msmc");

  win.setAlwaysOnTop(true, "main-menu");

  msmc
    .fastLaunch(
      "electron",
      (update) => {
        logger.info("[AUTH]", update.data);
        win.webContents.send("login_update", update);
      },
      options.visible
    )
    .then((result) => {
      win.setAlwaysOnTop(false);
      //Let's check if we logged in?
      if (msmc.errorCheck(result)) {
        logger.error("[AUTH] ERR", result.reason);
        return;
      }

      win.webContents.send("login_result", msmc.getMCLC().getAuth(result));
    });
};
