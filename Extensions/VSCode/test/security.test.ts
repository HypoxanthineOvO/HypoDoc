import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { isSafeWorkspaceResource } from "@hypodoc/render-model";

const extension = readFileSync(resolve(import.meta.dirname, "../src/extension.ts"), "utf8");

describe("VS Code Webview security contract", () => {
  it("keeps Webview capabilities and local roots narrow", () => {
    expect(extension).toContain("localResourceRoots:");
    expect(extension).toContain('vscode.Uri.joinPath(extensionUri, "dist")');
    expect(extension).toContain("documentRoot");
    expect(extension).toContain("default-src 'none'");
    expect(extension).toContain("connect-src 'none'");
    expect(extension).toContain("object-src 'none'");
  });

  it("rejects absolute, remote, and traversal resource paths", () => {
    expect(isSafeWorkspaceResource("figures/result.png")).toBe(true);
    expect(isSafeWorkspaceResource("../../result.png")).toBe(false);
    expect(isSafeWorkspaceResource("https://example.com/result.png")).toBe(false);
    expect(isSafeWorkspaceResource("/tmp/result.png")).toBe(false);
  });
});
