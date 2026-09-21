import { readFileSync } from "node:fs";
import { resolve, posix } from "node:path";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { transformSync } from "esbuild";
import { describe, expect, it, vi } from "vitest";
import * as parser from "@hypodoc/parser-core";
import * as model from "@hypodoc/render-model";

function preview(source: string) {
  const commands = new Map<string, () => void>();
  const uri = (value: string) => ({ toString: () => value });
  const document = { languageId: "markdown", fileName: "/docs/input.md", uri: uri("/docs/input.md"), getText: () => source, lineCount: 5 };
  const webview = {
    html: "", cspSource: "webview:", postMessage: vi.fn().mockResolvedValue(true),
    asWebviewUri: (u: any) => uri(`webview:${u.toString()}`),
    onDidReceiveMessage: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  };
  const panel = { webview, onDidDispose: vi.fn().mockReturnValue({ dispose: vi.fn() }), dispose: vi.fn() };
  const disposable = () => ({ dispose: vi.fn() });
  const vscode = {
    Uri: { joinPath: (base: any, ...parts: string[]) => uri(posix.join(base.toString(), ...parts)) },
    ViewColumn: { One: 1, Beside: 2, Active: 1 },
    commands: { registerCommand: (name: string, fn: () => void) => { commands.set(name, fn); return disposable(); } },
    window: {
      activeTextEditor: { document, viewColumn: 1 },
      createWebviewPanel: vi.fn().mockReturnValue(panel),
      onDidChangeActiveTextEditor: vi.fn().mockImplementation(disposable),
    },
    workspace: { onDidChangeTextDocument: vi.fn().mockImplementation(disposable) },
  };
  const exports: any = {};
  const module = { exports };
  const { code } = transformSync(readFileSync(resolve(import.meta.dirname, "../src/extension.ts"), "utf8"), { loader: "ts", format: "cjs", target: "es2022" });
  vm.runInNewContext(code, {
    exports, module, crypto: webcrypto,
    require: (name: string) => ({ vscode, "@hypodoc/parser-core": parser, "@hypodoc/render-model": model })[name],
  });
  module.exports.activate({ extensionUri: uri("/extension"), subscriptions: [] });
  commands.get("hypodoc.openPreview")!();
  return { vscode, webview };
}

describe("VS Code preview behavior", () => {
  it("creates restricted roots and sends the current document", () => {
    const { vscode, webview } = preview("# Current document");
    const options = vscode.window.createWebviewPanel.mock.calls[0][3];
    expect(options.localResourceRoots.map((u: any) => u.toString())).toEqual(["/extension/dist", "/docs"]);
    expect(webview.html).toContain("connect-src 'none'");
    expect(webview.html).toContain("object-src 'none'");
    expect(webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({ source: "# Current document" }));
  });

  it("does not create host resource URIs for external or escaping figures", () => {
    const { webview } = preview([
      '::: {.figure src="assets/safe.png"}', ":::",
      '::: {.figure src="../../secret.png"}', ":::",
      '::: {.figure src="https://example.com/a.png"}', ":::",
    ].join("\n"));
    expect(webview.postMessage.mock.calls[0][0].resources).toEqual({
      "assets/safe.png": "webview:/docs/assets/safe.png",
    });
  });
});
