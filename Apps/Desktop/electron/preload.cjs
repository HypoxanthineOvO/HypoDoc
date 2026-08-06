const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hypodocDesktop", Object.freeze({
  openDocument: () => ipcRenderer.invoke("hypodoc:open-document"),
  saveDocument: (input) => ipcRenderer.invoke("hypodoc:save-document", input),
}));
