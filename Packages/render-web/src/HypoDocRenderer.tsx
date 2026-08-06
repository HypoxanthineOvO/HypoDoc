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
import type { ComponentType, ReactNode } from "react";

import type { DirectiveNode, HypoDocNode } from "@hypodoc/parser-core";
import type { HypoDocRenderDocument } from "@hypodoc/render-model";

import { AsyncCode } from "./AsyncCode";
import { Markdown } from "./Markdown";
import { MermaidBlock } from "./MermaidBlock";

export interface HypoDocRendererProps {
  document: HypoDocRenderDocument;
  resolveResource?: (relativePath: string) => string | null;
  onNavigateSource?: (line: number) => void;
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
