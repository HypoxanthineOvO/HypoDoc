import { describe, expect, it } from "vitest";
import { parseHypoDoc } from "@hypodoc/parser-core";

import { createRenderDocument, createSlideDeck, isSafeWorkspaceResource } from "../src";

describe("renderer model", () => {
  it("projects answer content without deleting it from the parsed document", () => {
    const parsed = parseHypoDoc(
      ':::: {.qa #q kind="open"}\n::: {.question}\nPrompt\n:::\n::: {.answer}\nAnswer\n:::\n::::\n',
    );
    const student = createRenderDocument(parsed, { answerMode: "student" });
    const teacher = createRenderDocument(parsed, { answerMode: "teacher" });
    expect(JSON.stringify(student.nodes)).not.toContain('"name":"answer"');
    expect(JSON.stringify(teacher.nodes)).toContain('"name":"answer"');
    expect(JSON.stringify(parsed.nodes)).toContain('"name":"answer"');
  });

  it("shares immutable nodes and outline when projection does not change them", () => {
    const parsed = parseHypoDoc("# Heading\n\nParagraph.\n\n:::note\nBody.\n:::\n");
    const rendered = createRenderDocument(parsed, { answerMode: "review" });

    expect(rendered.nodes[0]).toBe(parsed.nodes[0]);
    expect(rendered.nodes.at(-1)).toBe(parsed.nodes.at(-1));
    expect(rendered.outline).toBe(parsed.outline);
  });

  it("allows only workspace-relative resource paths", () => {
    expect(isSafeWorkspaceResource("assets/figure.png")).toBe(true);
    expect(isSafeWorkspaceResource("../secret.png")).toBe(false);
    expect(isSafeWorkspaceResource("https://example.com/a.png")).toBe(false);
    expect(isSafeWorkspaceResource("C:\\secret.png")).toBe(false);
  });

  it("projects canonical beamer structure without dropping source membership", () => {
    const parsed = parseHypoDoc(
      [
        "---",
        "title: Deck",
        "profile: beamer",
        "section_dividers: true",
        "subsection_dividers: true",
        "---",
        "Preamble.",
        "# Part",
        "## Section",
        "### Frame One",
        "First body.",
        "---",
        "Continuation body.",
        "### Frame Two",
        "Second body.",
      ].join("\n"),
    );
    const deck = createSlideDeck(createRenderDocument(parsed, { answerMode: "review" }));

    expect(deck.valid, deck.diagnostics).toBe(true);
    expect(deck.preambleNodes).toHaveLength(1);
    expect(deck.contexts.map((item) => [item.level, item.title])).toEqual([
      [1, "Part"],
      [2, "Section"],
    ]);
    expect(deck.frames.map((frame) => [frame.kind, frame.title, frame.continuation])).toEqual([
      ["title", "Deck", 1],
      ["section-divider", "Part", 1],
      ["subsection-divider", "Section", 1],
      ["content", "Frame One", 1],
      ["content", "Frame One", 2],
      ["content", "Frame Two", 1],
    ]);
    expect(deck.frames[4]?.separatorNodeIds).toHaveLength(1);

    const represented = new Set([
      ...deck.preambleNodes.map((node) => node.id),
      ...deck.contexts.map((context) => context.id),
      ...deck.frames.flatMap((frame) => [frame.titleNodeId, ...frame.separatorNodeIds, ...frame.nodes.map((node) => node.id)]),
    ]);
    expect(parsed.nodes.every((node) => represented.has(node.id))).toBe(true);
  });

  it("keeps invalid slide content and returns located projection diagnostics", () => {
    const parsed = parseHypoDoc("---\nprofile: beamer\n---\n### Frame\nBody.\n---\n");
    const deck = createSlideDeck(createRenderDocument(parsed));
    expect(deck.valid).toBe(false);
    expect(deck.diagnostics.some((item) => item.code === "SLIDE_FRAME_EMPTY")).toBe(true);
    expect(deck.preambleNodes.some((node) => node.type === "thematicBreak")).toBe(true);
  });

  it("assigns a separator followed by an explicit H3 to the new frame", () => {
    const parsed = parseHypoDoc(
      "---\nprofile: beamer\nsection_dividers: false\n---\n### One\nFirst.\n---\n### Two\nSecond.\n",
    );
    const deck = createSlideDeck(createRenderDocument(parsed));
    expect(deck.valid, deck.diagnostics).toBe(true);
    expect(deck.frames).toHaveLength(2);
    expect(deck.frames[1]?.title).toBe("Two");
    expect(deck.frames[1]?.separatorNodeIds).toEqual([
      expect.stringMatching(/^break@/),
    ]);
  });

  it("refuses slide projection for non-beamer documents", () => {
    const parsed = parseHypoDoc("---\nprofile: article\n---\n# Article\n");
    const deck = createSlideDeck(createRenderDocument(parsed));
    expect(deck.valid).toBe(false);
    expect(deck.frames).toHaveLength(0);
    expect(deck.diagnostics[0]?.code).toBe("SLIDE_PROFILE_REQUIRED");
  });
});
