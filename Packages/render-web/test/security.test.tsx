// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseHypoDoc } from "@hypodoc/parser-core";
import { createRenderDocument } from "@hypodoc/render-model";

import { HypoDocRenderer } from "../src";

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
});
