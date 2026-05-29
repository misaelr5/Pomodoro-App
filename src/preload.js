const { contextBridge, ipcRenderer } = require("electron");

// Puente minimo: el renderer no toca Electron directo, solo estos comandos.
contextBridge.exposeInMainWorld("futureFocus", {
  onCloseRequest: (callback) => ipcRenderer.on("app-close-requested", callback),
  confirmClose: () => ipcRenderer.send("confirm-close"),
  openMiniWindow: () => ipcRenderer.send("open-mini-window"),
  sendMiniSnapshot: (snapshot) => ipcRenderer.send("mini-snapshot", snapshot),
  onMiniCommand: (callback) => ipcRenderer.on("mini-command", (_event, command) => callback(command)),
  onMiniSnapshot: (callback) => ipcRenderer.on("mini-snapshot", (_event, snapshot) => callback(snapshot)),
  miniCommand: (command) => ipcRenderer.send("mini-command", command),
  restoreMainWindow: () => ipcRenderer.send("restore-main-window"),
  closeMiniWindow: () => ipcRenderer.send("close-mini-window")
});

window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.dataset.platform = process.platform;
});
