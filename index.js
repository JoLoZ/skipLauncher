const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  crashReporter,
} = require("electron");
const fs = require("fs");

crashReporter.start({
  uploadToServer: false,
});


process.env.CONFIG_PATH = app.getPath("userData");

const config = require("./config");

const path = require("path");

console.info(`Boot up

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
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html").then(() => {
    require("./launch").login(mainWindow, {
      visible: "none",
      window: {
        transparent: true,
        frame: false,
      },
    });
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  app.setAsDefaultProtocolClient("skipLauncher");

  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  console.log("All windows closed. Assuming game launch.");
});

ipcMain.on("quit", (event, arg) => {
  app.quit();
});

ipcMain.on("login_new", (event, arg) => {
  require("./launch").login(mainWindow, arg);
});

function handleExit(code) {
  console.info("Minecraft exited with code", code);
  var exitWindow = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.height / 3,
    height: (screen.getPrimaryDisplay().workAreaSize.height / 3) * 1.5,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    movable: false,
    resizable: false,
  });

  exitWindow.loadFile("exit.html").then(syncBack);

  async function syncBack() {
    console.log("Starting file back sync...");

    require("./launch").syncFiles(
      path.join(process.env.CONFIG_PATH, "minecraft"),
      process.env.APPDATA + "/.minecraft",
      "exit",
      exitWindow
    );

    exitWindow.webContents.send("exit_msg", "Until next time!");
    setTimeout(() => {
      app.quit();
    }, 500);
  }
}

ipcMain.on("launch", (event, arg) => {
  console.info("--- LAUNCHING VERSION " + arg.version + " ---");
  require("./launch").launch(
    arg.version,
    arg.auth,
    mainWindow,
    handleExit,
    path.join(process.env.CONFIG_PATH, "minecraft")
  );
});

ipcMain.on("get_args", (event, arg) => {
  console.log("Args requested. Sent", process.argv);
  event.returnValue = process.argv;
});