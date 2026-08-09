import { gzipSync } from "node:zlib";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

import { parseHypoDoc } from "../Packages/parser-core/src/index.ts";

const root = resolve(import.meta.dirname, "..");
const sample = readFileSync(resolve(root, "research/fixtures/portable-surface.md"), "utf8");
const largeChunk = `\n## Generated section\n\n${"Portable Markdown content. ".repeat(70)}\n\n::: {.note title="Generated note"}\n${"Structured content. ".repeat(40)}\n:::\n\n\`\`\`typescript\nconst marker = "::: {.warning}";\n\`\`\`\n`;
const repeated = `---\ntitle: Performance fixture\nprofile: article\n---\n# Performance fixture\n${largeChunk.repeat(Math.max(1, Math.floor((1024 * 1024) / largeChunk.length)))}`;

function benchmark(source: string, iterations: number): { averageMs: number; maxMs: number } {
  for (let index = 0; index < 5; index += 1) parseHypoDoc(source);
  const samples: number[] = [];
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    const document = parseHypoDoc(source);
    const elapsed = performance.now() - start;
    if (!document.valid) throw new Error("performance fixture unexpectedly failed validation");
    samples.push(elapsed);
  }
  return {
    averageMs: Number((samples.reduce((sum, value) => sum + value, 0) / samples.length).toFixed(3)),
    maxMs: Number(Math.max(...samples).toFixed(3)),
  };
}

function javascriptAssets(directory: string): Array<{ file: string; bytes: number; gzipBytes: number }> {
  const output: Array<{ file: string; bytes: number; gzipBytes: number }> = [];
  const visit = (path: string): void => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = resolve(path, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.name.endsWith(".js")) {
        const content = readFileSync(child);
        output.push({
          file: child.slice(directory.length + 1).replaceAll("\\", "/"),
          bytes: statSync(child).size,
          gzipBytes: gzipSync(content, { level: 9 }).length,
        });
      }
    }
  };
  visit(directory);
  return output.sort((left, right) => right.bytes - left.bytes);
}

const desktopAssets = javascriptAssets(resolve(root, "Apps/Desktop/dist"));
const webviewAssets = javascriptAssets(resolve(root, "Extensions/VSCode/dist"));
const parser = {
  sampleBytes: Buffer.byteLength(sample),
  sample: benchmark(sample, 100),
  oneMiBBytes: Buffer.byteLength(repeated),
  oneMiB: benchmark(repeated, 5),
};
const budgets = {
  sampleAverageMs: 12,
  oneMiBAverageMs: 600,
  desktopInitialGzipBytes: 400_000,
  desktopMermaidGzipBytes: 900_000,
};
const desktopInitial = desktopAssets.find((item) => item.file.startsWith("assets/index-"));
const desktopMermaid = desktopAssets.find((item) => item.file.startsWith("assets/mermaid-"));
const checks = {
  sampleParser: parser.sample.averageMs <= budgets.sampleAverageMs,
  oneMiBParser: parser.oneMiB.averageMs <= budgets.oneMiBAverageMs,
  desktopInitial: Boolean(desktopInitial && desktopInitial.gzipBytes <= budgets.desktopInitialGzipBytes),
  desktopMermaid: Boolean(desktopMermaid && desktopMermaid.gzipBytes <= budgets.desktopMermaidGzipBytes),
};
const report = {
  protocol: "hypodoc.performance-baseline/v1",
  environment: { node: process.version, platform: process.platform, arch: process.arch },
  parser,
  budgets,
  checks,
  bundles: { desktop: desktopAssets, vscodeWebview: webviewAssets },
  valid: Object.values(checks).every(Boolean),
};
mkdirSync(resolve(root, "reports"), { recursive: true });
const output = resolve(root, process.env.HYPODOC_PERF_OUTPUT ?? "reports/performance-baseline.json");
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ protocol: report.protocol, valid: report.valid, parser, checks }));
if (!report.valid) process.exitCode = 1;
