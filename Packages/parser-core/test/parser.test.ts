import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parseHypoDoc } from "../src";

const fixture = readFileSync(resolve(import.meta.dirname, "../../../research/fixtures/portable-surface.md"), "utf8");
const specFixtures = resolve(import.meta.dirname, "../../../Spec/fixtures");

describe("parseHypoDoc", () => {
  it("preserves the required portable surface and nested directive order", () => {
    const document = parseHypoDoc(fixture);
    expect(document.valid).toBe(true);
    expect(document.profile).toBe("beamer");
    expect(document.outline.map((entry) => entry.depth)).toEqual([1, 2, 3, 3]);
    expect(document.nodes.filter((node) => node.type === "thematicBreak")).toHaveLength(1);

    const code = document.nodes.filter((node) => node.type === "code");
    expect(code.map((node) => node.language)).toEqual(["mermaid", "typescript"]);
    expect(code[1]?.value).toContain('::: {.warning}');

    const directives = document.nodes.filter((node) => node.type === "directive");
    expect(directives.map((node) => node.name)).toEqual(["note", "qa"]);
    const qa = directives[1];
    expect(qa?.type === "directive" ? qa.id : null).toBe("probe-choice");
  });

  it("fails closed for unknown directives, active HTML, and unclosed fences", () => {
    const document = parseHypoDoc("::: {.mystery}\n<script>alert(1)</script>\n");
    expect(document.valid).toBe(false);
    expect(document.diagnostics.map((item) => item.code)).toEqual(
      expect.arrayContaining(["UNKNOWN_DIRECTIVE", "UNSAFE_RAW_HTML", "DIRECTIVE_FENCE_UNCLOSED"]),
    );
  });

  it("does not interpret directive-like code payload", () => {
    const document = parseHypoDoc("```ts\n::: {.warning}\n```\n");
    expect(document.valid).toBe(true);
    expect(document.nodes).toHaveLength(1);
    expect(document.nodes[0]).toMatchObject({ type: "code", value: "::: {.warning}" });
  });

  it("rejects malformed assessment structure and unresolved choice IDs", () => {
    const document = parseHypoDoc(
      ':::: {.qa #q kind="single-choice"}\n::: {.answer choices="missing"}\nA\n:::\n::::\n',
    );
    expect(document.valid).toBe(false);
    expect(document.diagnostics.map((item) => item.code)).toEqual(
      expect.arrayContaining(["QA_QUESTION_CARDINALITY", "QA_CHOICES_CARDINALITY", "UNRESOLVED_CHOICE"]),
    );
  });

  it("accepts the complete M6 canonical surface", () => {
    const source = readFileSync(resolve(specFixtures, "m6/canonical/full-surface.md"), "utf8");
    const document = parseHypoDoc(source);
    expect(document.valid, document.diagnostics.map((item) => `${item.code}: ${item.message}`).join("\n")).toBe(true);
    expect(document.profile).toBe("article");
    expect(JSON.stringify(document.nodes)).toContain('"name":"table"');
  });

  it.each([
    ["code-pseudo-backtick.md", "python"],
    ["code-pseudo-tilde.md", "text"],
    ["indented-code-pseudo.md", null],
    ["nested-variable-fences.md", null],
    ["repeated-nodes.md", null],
  ])("accepts Spec M2 positive fixture %s", (name, language) => {
    const source = readFileSync(resolve(specFixtures, "m2/positive", name), "utf8");
    const document = parseHypoDoc(source);
    expect(document.valid, document.diagnostics.map((item) => `${item.code}: ${item.message}`).join("\n")).toBe(true);
    if (language) {
      expect(document.nodes.flatMap((node) => node.type === "directive" ? node.children : [node]))
        .toEqual(expect.arrayContaining([expect.objectContaining({ type: "code", language })]));
    }
  });

  it.each([
    ["m2/negative/unclosed-fence.md", "DIRECTIVE_FENCE_UNCLOSED"],
    ["m2/negative/nested-unknown-attributes.md", "UNKNOWN_ATTRIBUTE"],
    ["m2/negative/malformed-yaml.md", "FRONTMATTER_INVALID"],
    ["m2/negative/duplicate-metadata.md", "FRONTMATTER_INVALID"],
    ["m6/negative/note-unknown-attribute.md", "UNKNOWN_ATTRIBUTE"],
    ["m6/negative/figure-missing-src.md", "REQUIRED_ATTRIBUTE"],
    ["m6/negative/solution-outside-qa.md", "WRONG_PARENT"],
  ])("fails closed for Spec fixture %s", (name, code) => {
    const source = readFileSync(resolve(specFixtures, name), "utf8");
    const document = parseHypoDoc(source);
    expect(document.valid).toBe(false);
    expect(document.diagnostics.some((item) => item.code === code)).toBe(true);
  });

  it("is byte-for-byte deterministic across independent host parses", () => {
    const left = JSON.stringify(parseHypoDoc(fixture));
    const right = JSON.stringify(parseHypoDoc(fixture));
    expect(left).toBe(right);
  });
});
