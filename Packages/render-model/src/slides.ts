import type { Diagnostic, HypoDocNode, SourceRange } from "@hypodoc/parser-core";

import type { HypoDocRenderDocument } from "./index";

export interface SlideContext {
  id: string;
  level: 1 | 2;
  title: string;
  position: SourceRange;
}

export interface SlideFrame {
  id: string;
  kind: "content" | "title" | "section-divider" | "subsection-divider";
  title: string;
  subtitle: string | null;
  byline: string | null;
  titleNodeId: string;
  part: SlideContext | null;
  section: SlideContext | null;
  continuation: number;
  separatorNodeIds: string[];
  nodes: HypoDocNode[];
  position: SourceRange;
}

export interface HypoDocSlideDeck {
  protocol: "hypodoc.slide-deck/v1";
  sourceProtocol: HypoDocRenderDocument["protocol"];
  title: string;
  theme: HypoDocRenderDocument["theme"];
  metadata: Record<string, unknown>;
  preambleNodes: HypoDocNode[];
  contexts: SlideContext[];
  frames: SlideFrame[];
  diagnostics: Diagnostic[];
  valid: boolean;
}

interface DraftFrame {
  id: string;
  title: string;
  titleNodeId: string;
  titlePosition: SourceRange;
  part: SlideContext | null;
  section: SlideContext | null;
  continuation: number;
  separatorNodeIds: string[];
  nodes: HypoDocNode[];
}

function metadataBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function metadataPositiveInteger(value: unknown, fallback: number): number {
  const candidate = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(candidate) && candidate > 0 ? candidate : fallback;
}

function mergeRange(start: SourceRange, end: SourceRange): SourceRange {
  return { start: structuredClone(start.start), end: structuredClone(end.end) };
}

function projectionDiagnostic(
  code: string,
  message: string,
  range: SourceRange,
  repair: string,
): Diagnostic {
  return { code, severity: "error", message, range: structuredClone(range), repair };
}

function dividerFrame(
  context: SlideContext,
  kind: "section-divider" | "subsection-divider",
  part: SlideContext | null,
  section: SlideContext | null,
): SlideFrame {
  return {
    id: `slide:${context.id}`,
    kind,
    title: context.title,
    subtitle: null,
    byline: null,
    titleNodeId: context.id,
    part: part ? structuredClone(part) : null,
    section: section ? structuredClone(section) : null,
    continuation: 1,
    separatorNodeIds: [],
    nodes: [],
    position: structuredClone(context.position),
  };
}

function metadataText(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    const parts = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    return parts.length > 0 ? parts.join(", ") : null;
  }
  return null;
}

function titleFrame(document: HypoDocRenderDocument, position: SourceRange): SlideFrame | null {
  const title = metadataText(document.metadata.title);
  if (!title) return null;
  return {
    id: "slide:metadata:title",
    kind: "title",
    title,
    subtitle: metadataText(document.metadata.subtitle),
    byline: metadataText(document.metadata.author),
    titleNodeId: "metadata:title",
    part: null,
    section: null,
    continuation: 1,
    separatorNodeIds: [],
    nodes: [],
    position: structuredClone(position),
  };
}

export function createSlideDeck(document: HypoDocRenderDocument): HypoDocSlideDeck {
  const diagnostics = structuredClone(document.diagnostics);
  const deck: HypoDocSlideDeck = {
    protocol: "hypodoc.slide-deck/v1",
    sourceProtocol: document.protocol,
    title: document.title,
    theme: document.theme,
    metadata: structuredClone(document.metadata),
    preambleNodes: [],
    contexts: [],
    frames: [],
    diagnostics,
    valid: false,
  };

  const fallbackRange = document.nodes[0]?.position ?? {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 },
  };
  if (document.profile !== "beamer") {
    diagnostics.push(
      projectionDiagnostic(
        "SLIDE_PROFILE_REQUIRED",
        `SlideDeck projection requires profile: beamer, received ${document.profile}.`,
        fallbackRange,
        "Set canonical frontmatter field profile: beamer.",
      ),
    );
    return deck;
  }
  if (!document.valid) return deck;

  const sectionDividers = metadataBoolean(document.metadata.section_dividers, true);
  const subsectionDividers = metadataBoolean(document.metadata.subsection_dividers, false);
  const inheritanceLimit = metadataPositiveInteger(document.metadata.frame_title_inheritance_limit, 3);
  let part: SlideContext | null = null;
  let section: SlideContext | null = null;
  let current: DraftFrame | null = null;
  let lastTitle: { id: string; text: string; position: SourceRange } | null = null;
  let continuation = 1;
  let pendingSeparators: HypoDocNode[] = [];
  let sawContentFrame = false;

  const finish = (): void => {
    if (!current) return;
    const end = current.nodes.at(-1)?.position ?? current.titlePosition;
    if (current.nodes.length === 0) {
      diagnostics.push(
        projectionDiagnostic(
          "SLIDE_FRAME_EMPTY",
          `Frame ${JSON.stringify(current.title)} has no content.`,
          current.titlePosition,
          "Add frame content or remove the empty frame heading/separator.",
        ),
      );
    }
    deck.frames.push({
      id: current.id,
      kind: "content",
      title: current.title,
      subtitle: null,
      byline: null,
      titleNodeId: current.titleNodeId,
      part: current.part ? structuredClone(current.part) : null,
      section: current.section ? structuredClone(current.section) : null,
      continuation: current.continuation,
      separatorNodeIds: [...current.separatorNodeIds],
      nodes: [...current.nodes],
      position: mergeRange(current.titlePosition, end),
    });
    current = null;
    sawContentFrame = true;
  };

  const openingFrame = titleFrame(document, fallbackRange);
  if (openingFrame) deck.frames.push(openingFrame);

  const startContinuation = (node: HypoDocNode): void => {
    continuation += 1;
    if (!lastTitle) {
      diagnostics.push(
        projectionDiagnostic(
          "SLIDE_FRAME_TITLE_REQUIRED",
          "Content after a slide separator has no frame title to inherit.",
          node.position,
          "Add an H3 frame title before this content.",
        ),
      );
      deck.preambleNodes.push(node);
      pendingSeparators = [];
      return;
    }
    if (continuation > inheritanceLimit) {
      diagnostics.push(
        projectionDiagnostic(
          "SLIDE_TITLE_INHERITANCE_LIMIT",
          `Frame title ${JSON.stringify(lastTitle.text)} exceeds continuation limit ${inheritanceLimit}.`,
          node.position,
          "Add an explicit H3 frame title before this content.",
        ),
      );
    }
    current = {
      id: `slide:${lastTitle.id}:continuation:${continuation}`,
      title: lastTitle.text,
      titleNodeId: lastTitle.id,
      titlePosition: structuredClone(lastTitle.position),
      part: part ? structuredClone(part) : null,
      section: section ? structuredClone(section) : null,
      continuation,
      separatorNodeIds: pendingSeparators.map((item) => item.id),
      nodes: [],
    };
    pendingSeparators = [];
  };

  for (const node of document.nodes) {
    if (node.type === "heading" && (node.depth === 1 || node.depth === 2)) {
      finish();
      pendingSeparators = [];
      lastTitle = null;
      continuation = 1;
      const context: SlideContext = {
        id: node.id,
        level: node.depth,
        title: node.text,
        position: structuredClone(node.position),
      };
      deck.contexts.push(context);
      if (node.depth === 1) {
        part = context;
        section = null;
        if (sectionDividers) deck.frames.push(dividerFrame(context, "section-divider", part, section));
      } else {
        section = context;
        if (subsectionDividers) deck.frames.push(dividerFrame(context, "subsection-divider", part, section));
      }
      continue;
    }

    if (node.type === "heading" && node.depth === 3) {
      finish();
      const separatorNodeIds = pendingSeparators.map((item) => item.id);
      pendingSeparators = [];
      continuation = 1;
      lastTitle = { id: node.id, text: node.text, position: structuredClone(node.position) };
      current = {
        id: `slide:${node.id}`,
        title: node.text,
        titleNodeId: node.id,
        titlePosition: structuredClone(node.position),
        part: part ? structuredClone(part) : null,
        section: section ? structuredClone(section) : null,
        continuation,
        separatorNodeIds,
        nodes: [],
      };
      continue;
    }

    if (node.type === "thematicBreak") {
      finish();
      pendingSeparators.push(node);
      continue;
    }

    if (!current && pendingSeparators.length > 0) startContinuation(node);
    if (current) {
      current.nodes.push(node);
    } else {
      deck.preambleNodes.push(node);
      if (sawContentFrame) {
        diagnostics.push(
          projectionDiagnostic(
            "SLIDE_FRAME_TITLE_REQUIRED",
            "Slide content after a completed frame requires an H3 frame title.",
            node.position,
            "Add an H3 heading before this content.",
          ),
        );
      }
    }
  }

  finish();
  if (pendingSeparators.length > 0) {
    const separator = pendingSeparators.at(-1)!;
    diagnostics.push(
      projectionDiagnostic(
        "SLIDE_FRAME_EMPTY",
        "The deck ends with a slide separator and an empty frame.",
        separator.position,
        "Remove the trailing separator or add frame content.",
      ),
    );
    deck.preambleNodes.push(...pendingSeparators);
  }
  deck.valid = !diagnostics.some((item) => item.severity === "error");
  return deck;
}
