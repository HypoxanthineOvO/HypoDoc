import type { Diagnostic, DirectiveNode, HypoDocDocument, HypoDocNode } from "@hypodoc/parser-core";

export type AnswerMode = "student" | "review" | "teacher";
export type RenderTheme = "light" | "dark" | "system";

export interface RenderOptions {
  answerMode?: AnswerMode;
  theme?: RenderTheme;
  workspaceRoot?: string | null;
}

export interface HypoDocRenderDocument {
  protocol: "hypodoc.renderer-model/v1";
  sourceProtocol: HypoDocDocument["protocol"];
  specVersion: HypoDocDocument["specVersion"];
  registryDigest: string;
  title: string;
  profile: HypoDocDocument["profile"];
  answerMode: AnswerMode;
  theme: RenderTheme;
  metadata: Record<string, unknown>;
  nodes: HypoDocNode[];
  outline: HypoDocDocument["outline"];
  diagnostics: Diagnostic[];
  valid: boolean;
}

const SAFE_SEGMENT = /^[^\0<>:"|?*]+$/;

export function isSafeWorkspaceResource(path: string): boolean {
  if (!path || path.length > 1024 || path.startsWith("/") || path.startsWith("\\")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return false;
  const normalized = path.replaceAll("\\", "/");
  return normalized.split("/").every((part) => part !== ".." && part !== "." && SAFE_SEGMENT.test(part));
}

function projectNode(node: HypoDocNode, answerMode: AnswerMode, diagnostics: Diagnostic[]): HypoDocNode | null {
  if (node.type !== "directive") return node;
  if (answerMode === "student" && (node.name === "answer" || node.name === "solution")) return null;

  if (node.name === "figure") {
    const source = node.attributes.src;
    if (typeof source === "string" && !isSafeWorkspaceResource(source)) {
      diagnostics.push({
        code: "RESOURCE_OUTSIDE_WORKSPACE",
        severity: "error",
        message: `Figure source is not a safe workspace-relative path: ${source}`,
        range: node.position,
        repair: "Use a relative path that stays inside the active workspace.",
      });
    }
  }

  let changed = false;
  const children: HypoDocNode[] = [];
  for (const child of node.children) {
    const projected = projectNode(child, answerMode, diagnostics);
    if (projected === null) {
      changed = true;
      continue;
    }
    if (projected !== child) changed = true;
    children.push(projected);
  }
  if (!changed) return node;
  const copy: DirectiveNode = { ...node, children };
  return copy;
}

function answerModeOf(document: HypoDocDocument, requested?: AnswerMode): AnswerMode {
  if (requested) return requested;
  const value = document.metadata.answer_mode;
  return value === "review" || value === "teacher" || value === "student" ? value : "student";
}

export function createRenderDocument(
  document: HypoDocDocument,
  options: RenderOptions = {},
): HypoDocRenderDocument {
  const diagnostics = structuredClone(document.diagnostics);
  const answerMode = answerModeOf(document, options.answerMode);
  const nodes = document.nodes
    .map((node) => projectNode(node, answerMode, diagnostics))
    .filter((node): node is HypoDocNode => node !== null);
  const title =
    typeof document.metadata.title === "string" && document.metadata.title.trim()
      ? document.metadata.title.trim()
      : document.outline[0]?.text ?? "Untitled document";

  return {
    protocol: "hypodoc.renderer-model/v1",
    sourceProtocol: document.protocol,
    specVersion: document.specVersion,
    registryDigest: document.registryDigest,
    title,
    profile: document.profile,
    answerMode,
    theme: options.theme ?? "system",
    metadata: structuredClone(document.metadata),
    nodes,
    outline: document.outline,
    diagnostics,
    valid: !diagnostics.some((item) => item.severity === "error"),
  };
}

export function countSemanticNodes(nodes: HypoDocNode[]): number {
  return nodes.reduce(
    (total, node) => total + (node.type === "directive" ? 1 + countSemanticNodes(node.children) : 0),
    0,
  );
}

export { createSlideDeck } from "./slides";
export type { HypoDocSlideDeck, SlideContext, SlideFrame } from "./slides";
