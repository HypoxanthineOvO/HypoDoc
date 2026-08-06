import { createRoot } from "react-dom/client";

import { parseHypoDoc } from "@hypodoc/parser-core";
import { createRenderDocument } from "@hypodoc/render-model";
import { HypoDocRenderer } from "@hypodoc/render-web";
import "@hypodoc/render-web/styles.css";
import "./vscode.css";

interface VsCodeApi {
  postMessage(message: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

const vscode = acquireVsCodeApi();
const host = document.getElementById("root");
if (!host) throw new Error("Preview root is missing.");
const root = createRoot(host);

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  const message = event.data;
  if (
    typeof message !== "object" ||
    message === null ||
    !("type" in message) ||
    message.type !== "document" ||
    !("source" in message) ||
    typeof message.source !== "string" ||
    !("resources" in message) ||
    typeof message.resources !== "object" ||
    message.resources === null
  ) return;
  const resources = message.resources as Record<string, string>;
  const parsed = parseHypoDoc(message.source);
  const model = createRenderDocument(parsed, { theme: "system", answerMode: "review" });
  root.render(
    <HypoDocRenderer
      document={model}
      resolveResource={(path) => resources[path] ?? null}
      onNavigateSource={(line) => vscode.postMessage({ type: "navigate", line })}
    />,
  );
});
