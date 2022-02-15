const { app, BrowserWindow, ipcMain, screen, protocol } = require("electron");
const fs = require("fs");

try {
  fs.renameSync("latest.log", "old.log");
} catch {}
fs.unlink("old.log", console.log);
var logger = require("logger").createLogger("latest.log");
logger.format = require("./loggerFunc").format;

const path = require("path");

logger.setLevel("debug");

logger.info(`Boot up

---------------------
|   Skip Launcher   |
|      - Log -      |
---------------------
`);

var mainWindow = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: ((screen.getPrimaryDisplay().workAreaSize.height / 1.5) * 16) / 9,
    height: screen.getPrimaryDisplay().workAreaSize.height / 1.5,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    movable: false,
    resizable: false,
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  logger.debug("All windows closed. Assuming game launch.");
});

ipcMain.on("quit", (event, arg) => {
  app.quit();
});

ipcMain.on("login_new", (event, arg) => {
  require("./launch").login(mainWindow, arg);
});

ipcMain.on("launch", (event, arg) => {
  logger.info("--- LAUNCHING VERSION 1.8.9 ---");
  require("./launch").launch("1.8.9", arg, mainWindow);
});
