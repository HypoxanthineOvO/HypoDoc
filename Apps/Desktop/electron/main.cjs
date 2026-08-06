const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { readFile, writeFile } = require("node:fs/promises");
const { basename, extname, resolve } = require("node:path");

const ALLOWED_EXTENSIONS = new Set([".md", ".markdown"]);
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
const approvedDocuments = new Set();

function allowedDocumentPath(filePath) {
  return typeof filePath === "string" && ALLOWED_EXTENSIONS.has(extname(filePath).toLowerCase());
}

async function openDocument(window) {
  const result = await dialog.showOpenDialog(window, {
    properties: ["openFile"],
    filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
  });
  const filePath = result.filePaths[0];
  if (result.canceled || !filePath || !allowedDocumentPath(filePath)) return null;
  const content = await readFile(filePath, "utf8");
  if (Buffer.byteLength(content, "utf8") > MAX_DOCUMENT_BYTES) throw new Error("Document exceeds the 2 MB safety limit.");
  const approvedPath = resolve(filePath);
  approvedDocuments.add(approvedPath);
  return { path: approvedPath, name: basename(approvedPath), content };
}

async function saveDocument(window, input) {
  if (!input || typeof input.content !== "string" || Buffer.byteLength(input.content, "utf8") > MAX_DOCUMENT_BYTES) {
    throw new Error("Invalid document payload.");
  }
  const requestedPath = typeof input.path === "string" ? resolve(input.path) : null;
  let filePath = requestedPath && approvedDocuments.has(requestedPath) ? requestedPath : null;
  if (!filePath) {
    const result = await dialog.showSaveDialog(window, {
      defaultPath: "document.md",
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (result.canceled || !result.filePath || !allowedDocumentPath(result.filePath)) return null;
    filePath = resolve(result.filePath);
    approvedDocuments.add(filePath);
  }
  await writeFile(filePath, input.content, { encoding: "utf8", mode: 0o600 });
  return { path: filePath, name: basename(filePath) };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 720,
    minHeight: 540,
    backgroundColor: "#171c1f",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: resolve(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    const current = window.webContents.getURL();
    if (url !== current) event.preventDefault();
  });
  window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'",
        ],
      },
    });
  });

  const developmentUrl = process.env.HYPODOC_DEV_URL;
  if (developmentUrl && /^http:\/\/127\.0\.0\.1:\d+$/.test(developmentUrl)) {
    void window.loadURL(developmentUrl);
  } else {
    void window.loadFile(resolve(__dirname, "../dist/index.html"));
  }
  if (process.env.HYPODOC_SMOKE_EXIT === "1") {
    window.webContents.once("did-finish-load", () => {
      console.log("hypodoc-electron-smoke: production renderer loaded");
      setImmediate(() => app.quit());
    });
  }
  return window;
}

app.whenReady().then(() => {
  const window = createWindow();
  ipcMain.handle("hypodoc:open-document", () => openDocument(window));
  ipcMain.handle("hypodoc:save-document", (_event, input) => saveDocument(window, input));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
