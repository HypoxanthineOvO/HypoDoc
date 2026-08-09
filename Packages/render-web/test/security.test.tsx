// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseHypoDoc } from "@hypodoc/parser-core";
import { createRenderDocument, createSlideDeck } from "@hypodoc/render-model";

import { HypoDocRenderer, HypoDocSlideDeckRenderer } from "../src";

describe("web renderer security boundary", () => {
  it("fails closed and never emits active raw HTML", () => {
    const parsed = parseHypoDoc("# Unsafe\n\n<script>alert(1)</script>\n");
    const html = renderToStaticMarkup(<HypoDocRenderer document={createRenderDocument(parsed)} />);
    expect(html).toContain("Preview paused");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert(1)");
  });

  it("blocks resources outside the workspace", () => {
    const parsed = parseHypoDoc('::: {.figure src="../../secret.png"}\n:::\n');
    const model = createRenderDocument(parsed);
    expect(model.valid).toBe(false);
    expect(model.diagnostics.some((item) => item.code === "RESOURCE_OUTSIDE_WORKSPACE")).toBe(true);
  });

  it("renders the same ordered frame IDs in waterfall and presentation", () => {
    const parsed = parseHypoDoc(
      "---\nprofile: beamer\nsection_dividers: false\n---\n### One\nFirst.\n---\n### Two\nSecond.\n",
    );
    const deck = createSlideDeck(createRenderDocument(parsed));
    const waterfall = renderToStaticMarkup(
      <HypoDocSlideDeckRenderer deck={deck} mode="waterfall" />,
    );
    const presentation = renderToStaticMarkup(
      <HypoDocSlideDeckRenderer deck={deck} mode="presentation" activeFrame={1} />,
    );
    expect(waterfall.match(/data-slide-frame=/g)).toHaveLength(2);
    expect(waterfall.match(/data-slide-viewport="waterfall"/g)).toHaveLength(2);
    expect(waterfall.match(/data-slide-logical-size="960x540"/g)).toHaveLength(2);
    expect(waterfall.indexOf(deck.frames[0]?.id ?? "missing-first")).toBeLessThan(
      waterfall.indexOf(deck.frames[1]?.id ?? "missing-second"),
    );
    expect(presentation).toContain('data-slide-index="1"');
    expect(presentation).toContain('data-slide-viewport="presentation"');
    expect(presentation).toContain('data-slide-logical-size="960x540"');
    expect(presentation).toContain("Two");
    expect(presentation).not.toContain('data-slide-index="0"');
  });
});
