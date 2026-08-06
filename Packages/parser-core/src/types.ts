export interface SourcePoint {
  line: number;
  column: number;
  offset: number;
}

export interface SourceRange {
  start: SourcePoint;
  end: SourcePoint;
}

export interface Diagnostic {
  code: string;
  severity: "error" | "warning";
  message: string;
  range: SourceRange;
  repair?: string;
}

interface NodeBase {
  id: string;
  position: SourceRange;
}

export interface MarkdownNode extends NodeBase {
  type: "markdown";
  value: string;
}

export interface HeadingNode extends NodeBase {
  type: "heading";
  depth: number;
  text: string;
}

export interface CodeNode extends NodeBase {
  type: "code";
  language: string | null;
  meta: string | null;
  value: string;
}

export interface ThematicBreakNode extends NodeBase {
  type: "thematicBreak";
}

export interface DirectiveNode extends NodeBase {
  type: "directive";
  name: string;
  sourceId: string | null;
  attributes: Record<string, string | string[]>;
  fenceLength: number;
  children: HypoDocNode[];
}

export type HypoDocNode =
  | MarkdownNode
  | HeadingNode
  | CodeNode
  | ThematicBreakNode
  | DirectiveNode;

export interface OutlineEntry {
  id: string;
  depth: number;
  text: string;
  line: number;
}

export interface HypoDocDocument {
  protocol: "hypodoc.render-document/v1";
  specVersion: "0.2.0-rc.1";
  registryDigest: string;
  source: string;
  metadata: Record<string, unknown>;
  profile: "core" | "book" | "article" | "beamer";
  nodes: HypoDocNode[];
  outline: OutlineEntry[];
  diagnostics: Diagnostic[];
  valid: boolean;
}

export interface ParseOptions {
  maxBytes?: number;
  maxNodes?: number;
}
