import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseHypoDoc } from "../src";

const directory = resolve(import.meta.dirname, "../../../Renderers/LaTeX/src/hypolatex/resources/starters");
const templates = readdirSync(directory).filter((name) => name.endsWith(".md"));

describe("public authoring templates", () => {
  it.each(templates)("%s is valid in the shared preview parser", (name) => {
    const document = parseHypoDoc(readFileSync(resolve(directory, name), "utf8"));
    expect(document.valid, JSON.stringify(document.diagnostics)).toBe(true);
    expect(document.nodes.length).toBeGreaterThan(0);
  });
});
