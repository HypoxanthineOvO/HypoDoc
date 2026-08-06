import { parse as parseYaml } from "yaml";

import { DIRECTIVES, PROFILES, REGISTRY_DIGEST, SPEC_VERSION } from "./registry";
import type {
  Diagnostic,
  DirectiveNode,
  HypoDocDocument,
  HypoDocNode,
  OutlineEntry,
  ParseOptions,
  SourcePoint,
  SourceRange,
} from "./types";

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_NODES = 10_000;
const ACTIVE_HTML = /<(?:script|iframe|object|embed|link|meta|style)\b|\son[a-z]+\s*=|javascript\s*:/i;

interface LineInfo {
  text: string;
  line: number;
  offset: number;
}

interface ParseState {
  source: string;
  lines: LineInfo[];
  diagnostics: Diagnostic[];
  nodeCount: number;
  maxNodes: number;
}

interface ParsedAttributes {
  name: string | null;
  sourceId: string | null;
  attributes: Record<string, string | string[]>;
  errors: string[];
}

function linesOf(source: string): LineInfo[] {
  const raw = source.split("\n");
  let offset = 0;
  return raw.map((value, index) => {
    const text = value.endsWith("\r") ? value.slice(0, -1) : value;
    const item = { text, line: index + 1, offset };
    offset += value.length + (index < raw.length - 1 ? 1 : 0);
    return item;
  });
}

function point(line: LineInfo, column = 1): SourcePoint {
  return { line: line.line, column, offset: line.offset + column - 1 };
}

function range(start: LineInfo, end: LineInfo, endColumn = end.text.length + 1): SourceRange {
  return { start: point(start), end: point(end, endColumn) };
}

function pushDiagnostic(
  state: ParseState,
  code: string,
  message: string,
  target: SourceRange,
  repair?: string,
): void {
  state.diagnostics.push({ code, severity: "error", message, range: target, ...(repair ? { repair } : {}) });
}

function makeId(type: string, target: SourceRange): string {
  return `${type}@${target.start.line}:${target.start.column}`;
}

function tokenizeAttributes(input: string): { tokens: string[]; errors: string[] } {
  const tokens: string[] = [];
  const errors: string[] = [];
  let index = 0;
  while (index < input.length) {
    while (/\s/.test(input[index] ?? "")) index += 1;
    if (index >= input.length) break;
    const start = index;
    let quote: string | null = null;
    while (index < input.length) {
      const character = input[index] ?? "";
      if (quote) {
        if (character === "\\") {
          index += 2;
          continue;
        }
        if (character === quote) quote = null;
        index += 1;
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
        index += 1;
        continue;
      }
      if (/\s/.test(character)) break;
      index += 1;
    }
    if (quote) errors.push("Unclosed quoted attribute value.");
    tokens.push(input.slice(start, index));
  }
  return { tokens, errors };
}

function unquote(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1).replace(/\\([\\"'])/g, "$1");
  }
  return value;
}

function parseAttributes(input: string): ParsedAttributes {
  const { tokens, errors } = tokenizeAttributes(input);
  const classes: string[] = [];
  let sourceId: string | null = null;
  const attributes: Record<string, string | string[]> = {};
  for (const token of tokens) {
    if (token.startsWith(".") && /^\.[a-z][a-z0-9-]*$/.test(token)) {
      classes.push(token.slice(1));
      continue;
    }
    if (token.startsWith("#") && /^#[A-Za-z][A-Za-z0-9_.:-]*$/.test(token)) {
      if (sourceId) errors.push("A directive may declare only one identifier.");
      sourceId = token.slice(1);
      continue;
    }
    const equal = token.indexOf("=");
    if (equal <= 0) {
      errors.push(`Malformed attribute token: ${token}`);
      continue;
    }
    const key = token.slice(0, equal);
    const rawValue = token.slice(equal + 1);
    if (!/^[a-z][a-z0-9_-]*$/.test(key) || rawValue.length === 0) {
      errors.push(`Malformed attribute token: ${token}`);
      continue;
    }
    if (Object.hasOwn(attributes, key)) {
      errors.push(`Duplicate attribute: ${key}`);
      continue;
    }
    attributes[key] = unquote(rawValue);
  }
  if (classes.length !== 1) errors.push("A HypoDoc directive requires exactly one class.");
  return { name: classes[0] ?? null, sourceId, attributes, errors };
}

function parseCodeInfo(info: string): { language: string | null; meta: string | null } {
  if (!info) return { language: null, meta: null };
  if (info.startsWith("{") && info.endsWith("}")) {
    const parsed = parseAttributes(info.slice(1, -1));
    return { language: parsed.name, meta: info };
  }
  const [language, ...meta] = info.split(/\s+/).filter(Boolean);
  return { language: language ?? null, meta: meta.length ? meta.join(" ") : null };
}

function lineIsStructure(line: string): boolean {
  return (
    /^ {0,3}(?:`{3,}|~{3,})/.test(line) ||
    /^ {0,3}:{3,}\s*(?:\{|$)/.test(line) ||
    /^ {0,3}#{1,6}\s+/.test(line) ||
    /^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(line)
  );
}

function addNode(state: ParseState, node: HypoDocNode): HypoDocNode {
  state.nodeCount += 1;
  if (state.nodeCount === state.maxNodes + 1) {
    pushDiagnostic(
      state,
      "DOCUMENT_COMPLEXITY_LIMIT",
      `Document exceeds the ${state.maxNodes} node safety limit.`,
      node.position,
      "Split the document or reduce generated block count.",
    );
  }
  return node;
}

function parseBlocks(
  state: ParseState,
  start: number,
  end: number,
  closingFenceLength: number | null,
): { nodes: HypoDocNode[]; next: number; closed: boolean } {
  const nodes: HypoDocNode[] = [];
  let index = start;

  while (index < end && state.nodeCount <= state.maxNodes) {
    const current = state.lines[index];
    if (!current) break;

    const close = current.text.match(/^ {0,3}(:{3,})\s*$/);
    if (close) {
      if (closingFenceLength !== null && close[1]?.length === closingFenceLength) {
        return { nodes, next: index + 1, closed: true };
      }
      pushDiagnostic(
        state,
        "DIRECTIVE_FENCE_MISMATCH",
        closingFenceLength === null
          ? "Unexpected directive closing fence."
          : `Expected a ${closingFenceLength}-colon closing fence.`,
        range(current, current),
        closingFenceLength === null
          ? "Remove the closing fence or add its matching opener."
          : `Close this directive with exactly ${closingFenceLength} colons.`,
      );
      index += 1;
      continue;
    }

    const directiveOpen = current.text.match(/^ {0,3}(:{3,})\s*\{([^}]*)\}\s*$/);
    if (directiveOpen) {
      const fenceLength = directiveOpen[1]?.length ?? 3;
      const parsed = parseAttributes(directiveOpen[2] ?? "");
      const child = parseBlocks(state, index + 1, end, fenceLength);
      const endLine = state.lines[Math.max(index, child.next - 1)] ?? current;
      const target = range(current, endLine);
      for (const error of parsed.errors) {
        pushDiagnostic(state, "DIRECTIVE_ATTRIBUTE_SYNTAX", error, range(current, current));
      }
      const node: DirectiveNode = {
        type: "directive",
        id: makeId(parsed.name ?? "directive", target),
        name: parsed.name ?? "unknown",
        sourceId: parsed.sourceId,
        attributes: parsed.attributes,
        fenceLength,
        children: child.nodes,
        position: target,
      };
      nodes.push(addNode(state, node));
      if (!child.closed) {
        pushDiagnostic(
          state,
          "DIRECTIVE_FENCE_UNCLOSED",
          `The .${node.name} directive is not closed.`,
          range(current, current),
          `Add a closing fence containing exactly ${fenceLength} colons.`,
        );
      }
      index = child.next;
      continue;
    }

    const codeOpen = current.text.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (codeOpen) {
      const marker = codeOpen[1] ?? "```";
      const character = marker[0] ?? "`";
      const info = (codeOpen[2] ?? "").trim();
      let closeIndex = index + 1;
      const closer = new RegExp(`^ {0,3}${character === "`" ? "`" : "~"}{${marker.length},}\\s*$`);
      while (closeIndex < end && !closer.test(state.lines[closeIndex]?.text ?? "")) closeIndex += 1;
      const closed = closeIndex < end;
      const contentEnd = closed ? closeIndex : end;
      const value = state.lines.slice(index + 1, contentEnd).map((line) => line.text).join("\n");
      const codeInfo = parseCodeInfo(info);
      const endLine = state.lines[closed ? closeIndex : Math.max(index, end - 1)] ?? current;
      const target = range(current, endLine);
      nodes.push(
        addNode(state, {
          type: "code",
          id: makeId("code", target),
          language: codeInfo.language,
          meta: codeInfo.meta,
          value,
          position: target,
        }),
      );
      if (!closed) {
        pushDiagnostic(
          state,
          "CODE_FENCE_UNCLOSED",
          "The fenced code block is not closed.",
          range(current, current),
          `Add a closing ${character.repeat(marker.length)} fence.`,
        );
      }
      index = closed ? closeIndex + 1 : end;
      continue;
    }

    const heading = current.text.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const target = range(current, current);
      nodes.push(
        addNode(state, {
          type: "heading",
          id: makeId("heading", target),
          depth: heading[1]?.length ?? 1,
          text: heading[2] ?? "",
          position: target,
        }),
      );
      index += 1;
      continue;
    }

    if (/^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(current.text)) {
      const target = range(current, current);
      nodes.push(addNode(state, { type: "thematicBreak", id: makeId("break", target), position: target }));
      index += 1;
      continue;
    }

    const markdownStart = index;
    index += 1;
    while (index < end && !lineIsStructure(state.lines[index]?.text ?? "")) index += 1;
    const markdownLines = state.lines.slice(markdownStart, index);
    const value = markdownLines.map((line) => line.text).join("\n");
    if (value.trim().length > 0) {
      const last = markdownLines.at(-1) ?? current;
      const target = range(current, last);
      nodes.push(addNode(state, { type: "markdown", id: makeId("markdown", target), value, position: target }));
      if (ACTIVE_HTML.test(value)) {
        pushDiagnostic(
          state,
          "UNSAFE_RAW_HTML",
          "Active raw HTML is not accepted by the portable renderer.",
          target,
          "Use Markdown or a registered HypoDoc directive instead.",
        );
      }
    }
  }
  return { nodes, next: index, closed: closingFenceLength === null };
}

function directChildren(node: DirectiveNode, name: string): DirectiveNode[] {
  return node.children.filter(
    (child): child is DirectiveNode => child.type === "directive" && child.name === name,
  );
}

function nonBlankChildren(node: DirectiveNode): HypoDocNode[] {
  return node.children.filter(
    (child) => child.type !== "markdown" || child.value.trim().length > 0,
  );
}

function validateDirective(
  state: ParseState,
  node: DirectiveNode,
  parent: DirectiveNode | null,
  symbols: Set<string>,
): void {
  const definition = DIRECTIVES[node.name];
  if (!definition) {
    pushDiagnostic(
      state,
      "UNKNOWN_DIRECTIVE",
      `Unknown HypoDoc directive .${node.name}.`,
      node.position,
      "Use a directive declared by registry 0.2.0-rc.1.",
    );
  } else {
    for (const key of Object.keys(node.attributes)) {
      if (!Object.hasOwn(definition.attributes, key)) {
        pushDiagnostic(
          state,
          "UNKNOWN_ATTRIBUTE",
          `Attribute ${key} is not valid on .${node.name}.`,
          node.position,
          "Remove the renderer-specific or unsupported attribute.",
        );
      }
    }
    for (const [key, contract] of Object.entries(definition.attributes)) {
      const value = node.attributes[key];
      if (contract.required && (typeof value !== "string" || value.length === 0)) {
        pushDiagnostic(state, "REQUIRED_ATTRIBUTE", `.${node.name} requires ${key}.`, node.position);
      }
      if (contract.values && typeof value === "string" && !contract.values.includes(value)) {
        pushDiagnostic(
          state,
          "ATTRIBUTE_VALUE",
          `${key} on .${node.name} must be one of: ${contract.values.join(", ")}.`,
          node.position,
        );
      }
      if (contract.list && typeof value === "string") {
        node.attributes[key] = value.split(/\s+/).filter(Boolean);
      }
    }
    if (definition.requiresId && !node.sourceId) {
      pushDiagnostic(state, "REQUIRED_IDENTIFIER", `.${node.name} requires a stable #identifier.`, node.position);
    }
    if (node.sourceId) {
      if (symbols.has(node.sourceId)) {
        pushDiagnostic(state, "DUPLICATE_IDENTIFIER", `Duplicate identifier #${node.sourceId}.`, node.position);
      }
      symbols.add(node.sourceId);
      node.id = node.sourceId;
    }
    if (node.name === "figure" && typeof node.attributes.label === "string") {
      const label = node.attributes.label;
      if (symbols.has(label)) {
        pushDiagnostic(state, "DUPLICATE_IDENTIFIER", `Duplicate identifier #${label}.`, node.position);
      }
      symbols.add(label);
    }
    if (definition.empty && nonBlankChildren(node).length > 0) {
      pushDiagnostic(state, "CONTENT_NOT_ALLOWED", `.${node.name} must be empty.`, node.position);
    }
    if (definition.parents && (!parent || !definition.parents.includes(parent.name))) {
      pushDiagnostic(
        state,
        "WRONG_PARENT",
        `.${node.name} must be a direct child of ${definition.parents.map((name) => `.${name}`).join(" or ")}.`,
        node.position,
      );
    }
  }

  if (node.name === "qa") {
    const kind = node.attributes.kind;
    const questions = directChildren(node, "question");
    const choices = directChildren(node, "choices");
    const answers = directChildren(node, "answer");
    if (questions.length !== 1) {
      pushDiagnostic(state, "QA_QUESTION_CARDINALITY", ".qa requires exactly one direct .question.", node.position);
    }
    if (answers.length !== 1) {
      pushDiagnostic(state, "QA_ANSWER_CARDINALITY", ".qa requires exactly one direct .answer.", node.position);
    }
    if (kind === "open" && choices.length !== 0) {
      pushDiagnostic(state, "QA_OPEN_CHOICES", "Open .qa items cannot contain .choices.", node.position);
    }
    if ((kind === "single-choice" || kind === "multiple-choice") && choices.length !== 1) {
      pushDiagnostic(state, "QA_CHOICES_CARDINALITY", "Choice .qa items require exactly one .choices.", node.position);
    }
  }

  if (node.name === "choices" && directChildren(node, "choice").length === 0) {
    pushDiagnostic(state, "CHOICES_EMPTY", ".choices requires at least one .choice.", node.position);
  }

  if (node.name === "table") {
    const content = node.children.filter(
      (child): child is Extract<HypoDocNode, { type: "markdown" }> =>
        child.type === "markdown" && Boolean(child.value.trim()),
    );
    if (content.length !== 1 || !/^\s*\|.+\|\s*$/m.test(content[0]?.value ?? "")) {
      pushDiagnostic(state, "TABLE_CONTENT", ".table requires exactly one Markdown table.", node.position);
    }
  }

  for (const child of node.children) {
    if (child.type === "directive") validateDirective(state, child, node, symbols);
  }
}

function resolveReferences(state: ParseState, nodes: HypoDocNode[], symbols: Set<string>): void {
  const visit = (node: HypoDocNode): void => {
    if (node.type !== "directive") return;
    if (node.name === "ref") {
      const target = node.attributes.target;
      if (typeof target === "string" && !symbols.has(target)) {
        pushDiagnostic(state, "UNRESOLVED_REFERENCE", `Reference target #${target} does not exist.`, node.position);
      }
    }
    if (node.name === "answer" && Array.isArray(node.attributes.choices)) {
      for (const choice of node.attributes.choices) {
        if (!symbols.has(choice)) {
          pushDiagnostic(state, "UNRESOLVED_CHOICE", `Answer choice #${choice} does not exist.`, node.position);
        }
      }
    }
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
}

function buildOutline(nodes: HypoDocNode[]): OutlineEntry[] {
  const outline: OutlineEntry[] = [];
  const visit = (node: HypoDocNode): void => {
    if (node.type === "heading") {
      outline.push({ id: node.id, depth: node.depth, text: node.text, line: node.position.start.line });
    } else if (node.type === "directive") {
      node.children.forEach(visit);
    }
  };
  nodes.forEach(visit);
  return outline;
}

function frontmatter(
  state: ParseState,
): { metadata: Record<string, unknown>; contentStart: number } {
  const first = state.lines[0];
  if (!first || first.text !== "---") return { metadata: {}, contentStart: 0 };
  let end = 1;
  while (end < state.lines.length && state.lines[end]?.text !== "---") end += 1;
  if (end >= state.lines.length) {
    pushDiagnostic(
      state,
      "FRONTMATTER_UNCLOSED",
      "YAML frontmatter is not closed.",
      range(first, first),
      "Add a closing --- line.",
    );
    return { metadata: {}, contentStart: 1 };
  }
  const yaml = state.lines.slice(1, end).map((line) => line.text).join("\n");
  try {
    const value: unknown = parseYaml(yaml, { uniqueKeys: true });
    if (value === null) return { metadata: {}, contentStart: end + 1 };
    if (typeof value !== "object" || Array.isArray(value)) throw new Error("Frontmatter must be a map.");
    return { metadata: value as Record<string, unknown>, contentStart: end + 1 };
  } catch (error) {
    pushDiagnostic(
      state,
      "FRONTMATTER_INVALID",
      error instanceof Error ? error.message : "Invalid YAML frontmatter.",
      range(first, state.lines[end] ?? first),
      "Repair the YAML mapping before previewing the document.",
    );
    return { metadata: {}, contentStart: end + 1 };
  }
}

export function parseHypoDoc(source: string, options: ParseOptions = {}): HypoDocDocument {
  const normalized = source.replace(/\r\n?/g, "\n");
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const state: ParseState = {
    source: normalized,
    lines: linesOf(normalized),
    diagnostics: [],
    nodeCount: 0,
    maxNodes: options.maxNodes ?? DEFAULT_MAX_NODES,
  };

  if (new TextEncoder().encode(normalized).byteLength > maxBytes) {
    const first = state.lines[0] ?? { text: "", line: 1, offset: 0 };
    pushDiagnostic(
      state,
      "DOCUMENT_SIZE_LIMIT",
      `Document exceeds the ${maxBytes} byte safety limit.`,
      range(first, first),
      "Split the document before opening a live preview.",
    );
    return {
      protocol: "hypodoc.render-document/v1",
      specVersion: SPEC_VERSION,
      registryDigest: REGISTRY_DIGEST,
      source: normalized,
      metadata: {},
      profile: "core",
      nodes: [],
      outline: [],
      diagnostics: state.diagnostics,
      valid: false,
    };
  }

  const { metadata, contentStart } = frontmatter(state);
  const parsed = parseBlocks(state, contentStart, state.lines.length, null);
  const profileValue = metadata.profile;
  const profile =
    typeof profileValue === "string" && (PROFILES as readonly string[]).includes(profileValue)
      ? (profileValue as HypoDocDocument["profile"])
      : "core";
  if (profileValue !== undefined && profile === "core" && profileValue !== "core") {
    const first = state.lines[0] ?? { text: "", line: 1, offset: 0 };
    pushDiagnostic(
      state,
      "PROFILE_UNSUPPORTED",
      `Unsupported profile: ${String(profileValue)}.`,
      range(first, first),
      `Use one of: ${PROFILES.join(", ")}.`,
    );
  }

  const symbols = new Set<string>();
  for (const node of parsed.nodes) {
    if (node.type === "directive") validateDirective(state, node, null, symbols);
  }
  resolveReferences(state, parsed.nodes, symbols);

  return {
    protocol: "hypodoc.render-document/v1",
    specVersion: SPEC_VERSION,
    registryDigest: REGISTRY_DIGEST,
    source: normalized,
    metadata,
    profile,
    nodes: parsed.nodes,
    outline: buildOutline(parsed.nodes),
    diagnostics: state.diagnostics,
    valid: !state.diagnostics.some((item) => item.severity === "error"),
  };
}
