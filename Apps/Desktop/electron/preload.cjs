const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hypodocDesktop", Object.freeze({
  openDocument: () => ipcRenderer.invoke("hypodoc:open-document"),
  openWorkspace: () => ipcRenderer.invoke("hypodoc:open-workspace"),
  readWorkspaceDocument: (filePath) => ipcRenderer.invoke("hypodoc:read-workspace-document", filePath),
  saveDocument: (input) => ipcRenderer.invoke("hypodoc:save-document", input),
}));
