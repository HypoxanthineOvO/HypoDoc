import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { isSafeWorkspaceResource } from "@hypodoc/render-model";

import { AsyncCode } from "./AsyncCode";
import { MermaidBlock } from "./MermaidBlock";

function textOf(children: ReactNode): string {
  return Array.isArray(children) ? children.map(textOf).join("") : String(children ?? "");
}

function Code({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? "";
  const value = textOf(children).replace(/\n$/, "");
  if (!className) return <code {...props}>{children}</code>;
  if (language === "mermaid") return <MermaidBlock code={value} />;
  return <AsyncCode code={value} language={language} />;
}

function SafeImage({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string" || !isSafeWorkspaceResource(src)) {
    return <span className="hd-resource-blocked">Blocked image resource</span>;
  }
  return <img {...props} src={src} alt={alt ?? ""} loading="lazy" />;
}

function SafeLink({ href, children, ...props }: ComponentPropsWithoutRef<"a">) {
  const external = typeof href === "string" && /^[a-z][a-z0-9+.-]*:/i.test(href);
  return (
    <a
      {...props}
      href={href}
      rel={external ? "noreferrer noopener" : undefined}
      target={external ? "_blank" : undefined}
      onClick={external ? (event) => event.preventDefault() : undefined}
      title={external ? "External navigation is disabled in offline preview" : undefined}
    >
      {children}
    </a>
  );
}

export function Markdown({ value }: { value: string }) {
  return (
    <ReactMarkdown
      skipHtml
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeSanitize, rehypeKatex]}
      components={{ code: Code, img: SafeImage, a: SafeLink }}
    >
      {value}
    </ReactMarkdown>
  );
}
