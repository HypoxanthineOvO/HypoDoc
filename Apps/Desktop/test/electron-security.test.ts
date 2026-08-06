import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const main = readFileSync(resolve(root, "electron/main.cjs"), "utf8");
const preload = readFileSync(resolve(root, "electron/preload.cjs"), "utf8");

describe("Electron security contract", () => {
  it("keeps document content in a sandboxed, context-isolated renderer", () => {
    expect(main).toContain("nodeIntegration: false");
    expect(main).toContain("contextIsolation: true");
    expect(main).toContain("sandbox: true");
    expect(main).toContain("webSecurity: true");
    expect(main).toContain("object-src 'none'");
    expect(main).not.toContain("enableRemoteModule");
    expect(main).not.toContain("webviewTag: true");
  });

  it("allows silent writes only to paths authorized by a native dialog", () => {
    expect(main).toContain("const approvedDocuments = new Set()");
    expect(main).toContain("approvedDocuments.has(requestedPath)");
    expect(main).toContain("approvedDocuments.add(approvedPath)");
    expect(main).toContain("approvedDocuments.add(filePath)");
  });

  it("exposes only the typed open and save bridge", () => {
    expect(preload).toContain('exposeInMainWorld("hypodocDesktop"');
    expect(preload).toContain("openDocument");
    expect(preload).toContain("saveDocument");
    expect(preload).not.toContain("ipcRenderer: ipcRenderer");
  });
});
