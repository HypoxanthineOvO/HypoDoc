import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as path from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

// Execute the real host with fake Electron/IO, rather than searching its source.
async function host() {
  const handlers = new Map<string, (...args: any[]) => any>();
  const io = {
    readFile: vi.fn().mockResolvedValue("# Content"),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue([]),
    realpath: vi.fn(async (p: string) => p),
  };
  const dialog = {
    showOpenDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] }),
    showSaveDialog: vi.fn().mockResolvedValue({ canceled: true }),
  };
  const windows: any[] = [];
  class BrowserWindow {
    webContents = {
      setWindowOpenHandler: vi.fn(), on: vi.fn(), once: vi.fn(),
      session: { webRequest: { onHeadersReceived: vi.fn() } },
    };
    loadURL = vi.fn();
    loadFile = vi.fn();
    constructor(public options: any) { windows.push(this); }
  }
  const electron = {
    app: { whenReady: () => Promise.resolve(), on: vi.fn(), quit: vi.fn() },
    BrowserWindow, dialog, shell: { openExternal: vi.fn() },
    ipcMain: { handle: (name: string, fn: (...args: any[]) => any) => handlers.set(name, fn) },
  };
  vm.runInNewContext(readFileSync(resolve(import.meta.dirname, "../electron/main.cjs"), "utf8"), {
    require: (name: string) => ({ electron, "node:fs/promises": io, "node:path": path })[name],
    __dirname: resolve(import.meta.dirname, "../electron"),
    process: { platform: "linux", env: {} }, Buffer, console, setImmediate,
  });
  await Promise.resolve();
  return { io, dialog, windows, invoke: (name: string, value?: any) => handlers.get(`hypodoc:${name}`)!(null, value) };
}

describe("Electron host behavior", () => {
  it("creates an isolated window and denies new windows", async () => {
    const { windows } = await host();
    expect(windows[0].options.webPreferences).toMatchObject({
      nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true,
    });
    const open = windows[0].webContents.setWindowOpenHandler.mock.calls[0][0];
    expect(open({ url: "file:///private" })).toEqual({ action: "deny" });
  });

  it("does not write an unapproved path when the dialog is cancelled", async () => {
    const h = await host();
    expect(await h.invoke("save-document", { path: "/private/document.md", content: "changed" })).toBeNull();
    expect(h.dialog.showSaveDialog).toHaveBeenCalledOnce();
    expect(h.io.writeFile).not.toHaveBeenCalled();
  });

  it("allows subsequent saves only after a path is approved", async () => {
    const h = await host();
    const approved = resolve("approved.md");
    h.dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: approved });
    await h.invoke("save-document", { path: null, content: "first" });
    await h.invoke("save-document", { path: approved, content: "second" });
    expect(h.dialog.showSaveDialog).toHaveBeenCalledOnce();
    expect(h.io.writeFile).toHaveBeenLastCalledWith(approved, "second", { encoding: "utf8", mode: 0o600 });
  });

  it("rejects reading a document not authorized by a workspace dialog", async () => {
    const h = await host();
    await expect(h.invoke("read-workspace-document", "/private/document.md")).rejects.toThrow("authorized");
    expect(h.io.readFile).not.toHaveBeenCalled();
  });

  it("does not enumerate symlinks and rejects a changed canonical path", async () => {
    const h = await host();
    const root = resolve("workspace");
    const file = resolve(root, "notes.md");
    h.dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [root] });
    h.io.readdir.mockResolvedValue([
      { name: "notes.md", isSymbolicLink: () => false, isDirectory: () => false, isFile: () => true },
      { name: "escape.md", isSymbolicLink: () => true },
    ]);
    const workspace = await h.invoke("open-workspace");
    expect(workspace.documents.map((d: any) => d.path)).toEqual([file]);
    h.io.realpath.mockResolvedValue(resolve("outside.md"));
    await expect(h.invoke("read-workspace-document", file)).rejects.toThrow("changed");
    expect(h.io.readFile).not.toHaveBeenCalled();
  });

  it("rejects oversized writes before opening dialogs or touching disk", async () => {
    const h = await host();
    await expect(h.invoke("save-document", { content: "x".repeat(2 * 1024 * 1024 + 1) })).rejects.toThrow("payload");
    expect(h.dialog.showSaveDialog).not.toHaveBeenCalled();
    expect(h.io.writeFile).not.toHaveBeenCalled();
  });

  it("exposes only the frozen bridge and routes calls to expected channels", () => {
    const expose = vi.fn();
    const invoke = vi.fn();
    vm.runInNewContext(readFileSync(resolve(import.meta.dirname, "../electron/preload.cjs"), "utf8"), {
      require: () => ({ contextBridge: { exposeInMainWorld: expose }, ipcRenderer: { invoke } }),
    });
    const [name, bridge] = expose.mock.calls[0];
    expect(name).toBe("hypodocDesktop");
    expect(Object.isFrozen(bridge)).toBe(true);
    expect(Object.keys(bridge).sort()).toEqual(["openDocument", "openWorkspace", "readWorkspaceDocument", "saveDocument"]);
    bridge.readWorkspaceDocument("notes.md");
    expect(invoke).toHaveBeenCalledWith("hypodoc:read-workspace-document", "notes.md");
  });
});
