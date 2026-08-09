import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  FileCheck2,
  Flag,
  Image as ImageIcon,
  Info,
  Lightbulb,
  ListChecks,
  MessageCircleQuestion,
  NotebookPen,
  Quote,
  ShieldAlert,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

import type { DirectiveNode, HypoDocNode } from "@hypodoc/parser-core";
import type { HypoDocRenderDocument, HypoDocSlideDeck, SlideFrame } from "@hypodoc/render-model";

import { AsyncCode } from "./AsyncCode";
import { Markdown } from "./Markdown";
import { MermaidBlock } from "./MermaidBlock";

export interface HypoDocRendererProps {
  document: HypoDocRenderDocument;
  resolveResource?: (relativePath: string) => string | null;
  onNavigateSource?: (line: number) => void;
}

export interface HypoDocSlideDeckRendererProps {
  deck: HypoDocSlideDeck;
  mode: "waterfall" | "presentation";
  activeFrame?: number;
  scaleMode?: "fit" | "readable";
  resolveResource?: HypoDocRendererProps["resolveResource"];
  onNavigateSource?: HypoDocRendererProps["onNavigateSource"];
}

const icons: Record<string, ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  note: NotebookPen,
  tip: Lightbulb,
  warning: TriangleAlert,
  summary: BookOpenCheck,
  objective: Target,
  info: Info,
  task: CheckCircle2,
  requirement: ShieldAlert,
  deliverable: FileCheck2,
  checklist: ListChecks,
  rubric: ClipboardCheck,
  question: MessageCircleQuestion,
  hint: Sparkles,
  answer: CheckCircle2,
  solution: Quote,
  qa: CircleHelp,
};

function titleFor(node: DirectiveNode): string {
  const configured = node.attributes.title;
  if (typeof configured === "string" && configured.trim()) return configured;
  return node.name.replace(/(^|-)([a-z])/g, (_, prefix: string, letter: string) => `${prefix ? " " : ""}${letter.toUpperCase()}`);
}

function FigureNode({ node, resolveResource }: { node: DirectiveNode; resolveResource?: HypoDocRendererProps["resolveResource"] }) {
  const source = typeof node.attributes.src === "string" ? node.attributes.src : "";
  const resolved = resolveResource?.(source) ?? null;
  const caption = typeof node.attributes.caption === "string" ? node.attributes.caption : source;
  return (
    <figure className="hd-figure" id={node.sourceId ?? undefined}>
      {resolved ? (
        <img src={resolved} alt={caption} loading="lazy" />
      ) : (
        <div className="hd-figure-placeholder">
          <ImageIcon aria-hidden="true" size={28} />
          <span>{source || "Figure source unavailable"}</span>
        </div>
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function Directive({ node, resolveResource }: { node: DirectiveNode; resolveResource?: HypoDocRendererProps["resolveResource"] }) {
  if (node.name === "figure") return <FigureNode node={node} resolveResource={resolveResource} />;
  if (node.name === "ref") {
    const target = typeof node.attributes.target === "string" ? node.attributes.target : "";
    return <a className="hd-reference" href={`#${target}`}>See {target}</a>;
  }
  if (node.name === "choice") {
    return (
      <div className="hd-choice" id={node.sourceId ?? undefined}>
        <span className="hd-choice-marker" aria-hidden="true" />
        <div>{renderNodes(node.children, resolveResource)}</div>
      </div>
    );
  }
  if (node.name === "choices") {
    return <div className="hd-choices">{renderNodes(node.children, resolveResource)}</div>;
  }
  if (node.name === "table") {
    return (
      <figure className="hd-controlled-table" id={node.sourceId ?? undefined}>
        {node.attributes.caption ? <figcaption>{String(node.attributes.caption)}</figcaption> : null}
        {renderNodes(node.children, resolveResource)}
      </figure>
    );
  }

  const Icon = icons[node.name] ?? Flag;
  const assessment = ["qa", "question", "hint", "answer", "solution"].includes(node.name);
  return (
    <section
      className={`hd-directive hd-${node.name}${assessment ? " hd-assessment" : ""}`}
      id={node.sourceId ?? undefined}
      data-directive={node.name}
    >
      <header className="hd-directive-header">
        <Icon aria-hidden={true} size={17} />
        <span>{titleFor(node)}</span>
        {node.name === "qa" && typeof node.attributes.kind === "string" ? (
          <span className="hd-directive-kind">{node.attributes.kind}</span>
        ) : null}
      </header>
      <div className="hd-directive-body">{renderNodes(node.children, resolveResource)}</div>
    </section>
  );
}

function renderNode(node: HypoDocNode, resolveResource?: HypoDocRendererProps["resolveResource"]): ReactNode {
  switch (node.type) {
    case "markdown":
      return <Markdown key={node.id} value={node.value} />;
    case "heading": {
      const Tag = `h${node.depth}` as "h1";
      return <Tag key={node.id} id={node.id}>{node.text}</Tag>;
    }
    case "thematicBreak":
      return <hr key={node.id} />;
    case "code":
      return node.language === "mermaid" ? (
        <MermaidBlock key={node.id} code={node.value} />
      ) : (
        <AsyncCode key={node.id} code={node.value} language={node.language ?? "text"} />
      );
    case "directive":
      return <Directive key={node.id} node={node} resolveResource={resolveResource} />;
  }
}

function renderNodes(nodes: HypoDocNode[], resolveResource?: HypoDocRendererProps["resolveResource"]): ReactNode {
  return nodes.map((node) => renderNode(node, resolveResource));
}

function FrameSurface({
  frame,
  index,
  total,
  resolveResource,
  onNavigateSource,
}: {
  frame: SlideFrame;
  index: number;
  total: number;
  resolveResource?: HypoDocRendererProps["resolveResource"];
  onNavigateSource?: HypoDocRendererProps["onNavigateSource"];
}) {
  const breadcrumb = [frame.part?.title, frame.section?.title].filter(Boolean).join(" / ");
  const divider = frame.kind !== "content";
  return (
    <section
      className={`hd-slide-frame hd-slide-${frame.kind}`}
      data-slide-frame={frame.id}
      data-slide-index={index}
      aria-label={`Slide ${index + 1} of ${total}: ${frame.title}`}
    >
      {divider ? (
        <div className="hd-slide-divider-content">
          <span>
            {frame.kind === "title"
              ? "Presentation"
              : frame.kind === "section-divider"
                ? "Part"
                : "Section"}
          </span>
          <h2>{frame.title}</h2>
          {frame.subtitle ? <p className="hd-slide-subtitle">{frame.subtitle}</p> : null}
          {frame.byline ? <p className="hd-slide-byline">{frame.byline}</p> : null}
        </div>
      ) : (
        <>
          <header className="hd-slide-header">
            <div>
              {breadcrumb ? <p>{breadcrumb}</p> : null}
              <button
                type="button"
                onClick={() => onNavigateSource?.(frame.position.start.line)}
                title="Go to slide source"
              >
                {frame.title}
              </button>
            </div>
            {frame.continuation > 1 ? <span>Continued {frame.continuation}</span> : null}
          </header>
          <div className="hd-slide-body">{renderNodes(frame.nodes, resolveResource)}</div>
        </>
      )}
      {frame.kind === "content" ? (
        <footer className="hd-slide-footer">
          <span>{frame.part?.title ?? deckTitleFallback(frame)}</span>
          <span>{index + 1} / {total}</span>
        </footer>
      ) : null}
    </section>
  );
}

const SLIDE_LOGICAL_WIDTH = 960;
const SLIDE_LOGICAL_HEIGHT = 540;

function ScaledFrameSurface({
  mode,
  scaleMode,
  ...frameProps
}: Parameters<typeof FrameSurface>[0] & {
  mode: "waterfall" | "presentation";
  scaleMode: "fit" | "readable";
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: SLIDE_LOGICAL_WIDTH, height: SLIDE_LOGICAL_HEIGHT });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const updateBounds = () => {
      const next = viewport.getBoundingClientRect();
      if (next.width > 0 && next.height > 0) {
        setBounds({ width: next.width, height: next.height });
      }
    };
    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const fitScale = Math.min(
    1,
    bounds.width / SLIDE_LOGICAL_WIDTH,
    mode === "presentation" ? bounds.height / SLIDE_LOGICAL_HEIGHT : 1,
  );
  const minimumReadableScale = mode === "presentation" && scaleMode === "readable" && bounds.width < 720
    ? 0.62
    : 0;
  const scale = Math.max(fitScale, minimumReadableScale);
  const scaledWidth = SLIDE_LOGICAL_WIDTH * scale;
  const scaledHeight = SLIDE_LOGICAL_HEIGHT * scale;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) return;
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
  }, [scale]);

  return (
    <div
      ref={viewportRef}
      className={`hd-slide-viewport hd-slide-viewport-${mode}`}
      data-slide-viewport={mode}
      data-slide-scale={scale.toFixed(4)}
      data-slide-logical-size={`${SLIDE_LOGICAL_WIDTH}x${SLIDE_LOGICAL_HEIGHT}`}
      style={mode === "waterfall" ? { height: `${scaledHeight}px` } : undefined}
    >
      <div className="hd-slide-scale-box" style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}>
        <div className="hd-slide-logical-canvas" style={{ transform: `scale(${scale})` }}>
          <FrameSurface {...frameProps} />
        </div>
      </div>
    </div>
  );
}

function deckTitleFallback(frame: SlideFrame): string {
  return frame.section?.title ?? "HypoDoc";
}

function BlockedPreview({ document, onNavigateSource }: Pick<HypoDocRendererProps, "document" | "onNavigateSource">) {
  return (
    <section className="hd-preview-blocked" role="alert">
      <AlertCircle aria-hidden="true" size={28} />
      <h2>Preview paused</h2>
      <p>This document contains unsupported or unsafe input. Fix the reported issues to resume rendering.</p>
      <ol>
        {document.diagnostics.map((diagnostic, index) => (
          <li key={`${diagnostic.code}-${diagnostic.range.start.offset}-${index}`}>
            <button type="button" onClick={() => onNavigateSource?.(diagnostic.range.start.line)}>
              <strong>{diagnostic.code}</strong>
              <span>{diagnostic.message}</span>
              <small>Line {diagnostic.range.start.line}</small>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HypoDocRenderer({ document, resolveResource, onNavigateSource }: HypoDocRendererProps) {
  if (!document.valid) return <BlockedPreview document={document} onNavigateSource={onNavigateSource} />;
  return (
    <article className="hd-document" data-profile={document.profile}>
      {document.metadata.subtitle ? <p className="hd-subtitle">{String(document.metadata.subtitle)}</p> : null}
      {renderNodes(document.nodes, resolveResource)}
    </article>
  );
}

export function HypoDocSlideDeckRenderer({
  deck,
  mode,
  activeFrame = 0,
  scaleMode = "fit",
  resolveResource,
  onNavigateSource,
}: HypoDocSlideDeckRendererProps) {
  if (!deck.valid) {
    return (
      <section className="hd-preview-blocked" role="alert">
        <AlertCircle aria-hidden="true" size={28} />
        <h2>Slides unavailable</h2>
        <p>The deck projection is invalid. The host can fall back to document view.</p>
      </section>
    );
  }
  const safeIndex = Math.min(Math.max(0, activeFrame), Math.max(0, deck.frames.length - 1));
  const frames = mode === "presentation" ? deck.frames.slice(safeIndex, safeIndex + 1) : deck.frames;
  const palette = ["red", "blue", "yellow", "gray", "mono"].includes(String(deck.metadata.palette))
    ? String(deck.metadata.palette)
    : "red";
  return (
    <article
      className={`hd-slide-deck hd-slide-deck-${mode} hd-slide-palette-${palette}`}
      data-slide-count={deck.frames.length}
      aria-label={`${deck.title} slide deck`}
      aria-live={mode === "presentation" ? "polite" : undefined}
    >
      {mode === "waterfall" && deck.preambleNodes.length ? (
        <section className="hd-slide-preamble">
          <h2>{deck.title}</h2>
          {renderNodes(deck.preambleNodes, resolveResource)}
        </section>
      ) : null}
      {frames.map((frame, offset) => {
        const index = mode === "presentation" ? safeIndex : offset;
        return (
          <ScaledFrameSurface
            key={frame.id}
            mode={mode}
            scaleMode={scaleMode}
            frame={frame}
            index={index}
            total={deck.frames.length}
            resolveResource={resolveResource}
            onNavigateSource={onNavigateSource}
          />
        );
      })}
    </article>
  );
}
