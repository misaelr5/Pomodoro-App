const { app, BrowserWindow, Notification, ipcMain } = require("electron");
const path = require("path");

let allowClose = false;
let mainWindow = null;
let miniWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 820,
    minHeight: 620,
    title: "Pomodoro App",
    backgroundColor: "#f3f4f6",
    icon: path.join(__dirname, "renderer", "assets", "pomodoro-app-icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: true,
      devTools: false,
      spellcheck: false,
      affinity: "pomodoro-app-main"
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  // Nota mia: el cierre pasa primero por la UI para mostrar resumen del día.
  mainWindow.on("close", (event) => {
    if (allowClose) {
      return;
    }
    event.preventDefault();
    mainWindow.webContents.send("app-close-requested");
  });
}

function createMiniWindow() {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.show();
    miniWindow.focus();
    return;
  }

  miniWindow = new BrowserWindow({
    width: 430,
    height: 210,
    minWidth: 300,
    minHeight: 130,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    transparent: true,
    title: "Pomodoro App Mini",
    icon: path.join(__dirname, "renderer", "assets", "pomodoro-app-icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      devTools: false,
      spellcheck: false,
      affinity: "pomodoro-app-mini"
    }
  });

  miniWindow.loadFile(path.join(__dirname, "renderer", "mini.html"));
  miniWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send("mini-command", "requestSnapshot");
  });
  miniWindow.on("closed", () => {
    miniWindow = null;
  });
}

ipcMain.on("confirm-close", () => {
  allowClose = true;
  BrowserWindow.getAllWindows().forEach((window) => window.close());
});

ipcMain.on("open-mini-window", () => {
  createMiniWindow();
  mainWindow?.hide();
});

ipcMain.on("mini-snapshot", (_event, snapshot) => {
  miniWindow?.webContents.send("mini-snapshot", snapshot);
});

ipcMain.on("mini-command", (_event, command) => {
  mainWindow?.webContents.send("mini-command", command);
});

ipcMain.on("restore-main-window", () => {
  mainWindow?.show();
  mainWindow?.focus();
  miniWindow?.close();
});

ipcMain.on("close-mini-window", () => {
  miniWindow?.close();
});

ipcMain.on("set-mini-always-on-top", (_event, value) => {
  miniWindow?.setAlwaysOnTop(Boolean(value));
});

ipcMain.on("notify", (_event, payload) => {
  if (!Notification.isSupported()) return;
  new Notification({
    title: payload?.title ?? "Pomodoro App",
    body: payload?.body ?? ""
  }).show();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
