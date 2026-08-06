import * as vscode from "vscode";

import { parseHypoDoc, type HypoDocNode } from "@hypodoc/parser-core";
import { isSafeWorkspaceResource } from "@hypodoc/render-model";

interface PreviewMessage {
  type: "document";
  source: string;
  resources: Record<string, string>;
}

function nonce(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

function collectResources(nodes: HypoDocNode[]): string[] {
  const resources = new Set<string>();
  const visit = (node: HypoDocNode): void => {
    if (node.type !== "directive") return;
    if (node.name === "figure" && typeof node.attributes.src === "string") {
      resources.add(node.attributes.src);
    }
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return [...resources];
}

class PreviewController {
  readonly panel: vscode.WebviewPanel;
  private document: vscode.TextDocument;
  private readonly extensionUri: vscode.Uri;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(extensionUri: vscode.Uri, document: vscode.TextDocument, column: vscode.ViewColumn) {
    this.extensionUri = extensionUri;
    this.document = document;
    const documentRoot = vscode.Uri.joinPath(document.uri, "..");
    this.panel = vscode.window.createWebviewPanel(
      "hypodoc.preview",
      `Preview: ${document.fileName.split(/[\\/]/).at(-1) ?? "HypoDoc"}`,
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist"), documentRoot],
      },
    );
    this.panel.webview.html = this.html();
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.uri.toString() === this.document.uri.toString()) void this.update();
      }),
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor?.document.languageId === "markdown" && this.panel.active) {
          this.document = editor.document;
          void this.update();
        }
      }),
      this.panel.webview.onDidReceiveMessage((message: unknown) => {
        if (
          typeof message === "object" &&
          message !== null &&
          "type" in message &&
          message.type === "navigate" &&
          "line" in message &&
          Number.isInteger(message.line)
        ) {
          void this.revealLine(Number(message.line));
        }
      }),
      this.panel.onDidDispose(() => this.dispose()),
    );
    void this.update();
  }

  private async revealLine(oneBasedLine: number): Promise<void> {
    const editor = await vscode.window.showTextDocument(this.document, vscode.ViewColumn.One, false);
    const line = Math.max(0, Math.min(oneBasedLine - 1, this.document.lineCount - 1));
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }

  private async update(): Promise<void> {
    const parsed = parseHypoDoc(this.document.getText());
    const directory = vscode.Uri.joinPath(this.document.uri, "..");
    const resources: Record<string, string> = Object.create(null) as Record<string, string>;
    for (const path of collectResources(parsed.nodes)) {
      if (!isSafeWorkspaceResource(path)) continue;
      const uri = vscode.Uri.joinPath(directory, ...path.replaceAll("\\", "/").split("/"));
      resources[path] = this.panel.webview.asWebviewUri(uri).toString();
    }
    const message: PreviewMessage = { type: "document", source: this.document.getText(), resources };
    await this.panel.webview.postMessage(message);
  }

  private html(): string {
    const scriptUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "webview.js"));
    const styleUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "dist", "webview.css"));
    const token = nonce();
    return `<!doctype html>
<html lang="en" data-host="vscode">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource} data: blob:; font-src ${this.panel.webview.cspSource} data:; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${token}' ${this.panel.webview.cspSource}; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'">
    <link rel="stylesheet" href="${styleUri}">
    <title>HypoDoc Preview</title>
  </head>
  <body>
    <main id="root" aria-live="polite"></main>
    <script type="module" nonce="${token}" src="${scriptUri}"></script>
  </body>
</html>`;
  }

  dispose(): void {
    while (this.disposables.length) this.disposables.pop()?.dispose();
  }
}

let preview: PreviewController | null = null;

function openPreview(context: vscode.ExtensionContext, beside: boolean): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "markdown") {
    void vscode.window.showWarningMessage("Open a Markdown document before starting HypoDoc preview.");
    return;
  }
  preview?.dispose();
  preview?.panel.dispose();
  preview = new PreviewController(
    context.extensionUri,
    editor.document,
    beside ? vscode.ViewColumn.Beside : editor.viewColumn ?? vscode.ViewColumn.Active,
  );
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("hypodoc.openPreview", () => openPreview(context, false)),
    vscode.commands.registerCommand("hypodoc.openPreviewToSide", () => openPreview(context, true)),
  );
}

export function deactivate(): void {
  preview?.dispose();
}
