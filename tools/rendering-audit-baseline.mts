import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

import { parseHypoDoc } from "../Packages/parser-core/src/index.ts";
import { createRenderDocument, createSlideDeck } from "../Packages/render-model/src/index.ts";

const root = resolve(import.meta.dirname, "..");
const sample = readFileSync(resolve(root, "research/fixtures/portable-surface.md"), "utf8");
const largeChunk = `\n## Generated section\n\n${"Portable Markdown content. ".repeat(70)}\n\n::: {.note title="Generated note"}\n${"Structured content. ".repeat(40)}\n:::\n`;
const oneMiB = `---\ntitle: Rendering baseline\nprofile: article\n---\n# Rendering baseline\n${largeChunk.repeat(Math.max(1, Math.floor((1024 * 1024) / largeChunk.length)))}`;
const largeSlideChunk = `\n### Generated frame\n\n${"Portable slide content. ".repeat(100)}\n\n::: {.note title="Generated note"}\n${"Structured slide content. ".repeat(50)}\n:::\n`;
const oneMiBSlides = `---\ntitle: Slide rendering baseline\nprofile: beamer\nsection_dividers: false\n---\n# Rendering baseline\n${largeSlideChunk.repeat(Math.max(1, Math.floor((1024 * 1024) / largeSlideChunk.length)))}`;

interface Distribution {
  iterations: number;
  medianMs: number;
  p95Ms: number;
  maxMs: number;
}

function distribution(samples: number[]): Distribution {
  const ordered = [...samples].sort((left, right) => left - right);
  const percentile = (ratio: number): number =>
    ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * ratio) - 1)] ?? 0;
  return {
    iterations: samples.length,
    medianMs: Number(percentile(0.5).toFixed(3)),
    p95Ms: Number(percentile(0.95).toFixed(3)),
    maxMs: Number((ordered.at(-1) ?? 0).toFixed(3)),
  };
}

function benchmark(iterations: number, operation: () => void): Distribution {
  for (let index = 0; index < 5; index += 1) operation();
  const samples: number[] = [];
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    operation();
    samples.push(performance.now() - start);
  }
  return distribution(samples);
}

function pipeline(source: string): void {
  const parsed = parseHypoDoc(source);
  const document = createRenderDocument(parsed, { answerMode: "review", theme: "light" });
  if (!document.valid) throw new Error("rendering baseline fixture is invalid");
}

const parsedSample = parseHypoDoc(sample);
const parsedLarge = parseHypoDoc(oneMiB);
const parsedLargeSlides = parseHypoDoc(oneMiBSlides);
const renderedSample = createRenderDocument(parsedSample, { answerMode: "review", theme: "light" });
const renderedLargeSlides = createRenderDocument(parsedLargeSlides, { answerMode: "review", theme: "light" });
const heapBefore = process.memoryUsage().heapUsed;
for (let index = 0; index < 30; index += 1) {
  createRenderDocument(parsedLarge, { answerMode: "review", theme: "light" });
}
const heapAfter = process.memoryUsage().heapUsed;

const report = {
  protocol: "hypodoc.rendering-audit-baseline/v1",
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  fixtures: {
    sampleBytes: Buffer.byteLength(sample),
    oneMiBBytes: Buffer.byteLength(oneMiB),
    oneMiBSlidesBytes: Buffer.byteLength(oneMiBSlides),
  },
  pipeline: {
    sample: benchmark(100, () => pipeline(sample)),
    oneMiB: benchmark(15, () => pipeline(oneMiB)),
  },
  projectionOnly: {
    sample: benchmark(100, () => {
      createRenderDocument(parsedSample, { answerMode: "review", theme: "light" });
    }),
    oneMiB: benchmark(15, () => {
      createRenderDocument(parsedLarge, { answerMode: "review", theme: "light" });
    }),
  },
  slideDeck: {
    sample: benchmark(100, () => {
      createSlideDeck(renderedSample);
    }),
    oneMiB: benchmark(15, () => {
      createSlideDeck(renderedLargeSlides);
    }),
  },
  slidePipeline: {
    sample: benchmark(100, () => {
      createSlideDeck(createRenderDocument(parsedSample, { answerMode: "review", theme: "light" }));
    }),
    oneMiB: benchmark(15, () => {
      createSlideDeck(createRenderDocument(parsedLargeSlides, { answerMode: "review", theme: "light" }));
    }),
  },
  memory: {
    projectionIterations: 30,
    heapBeforeBytes: heapBefore,
    heapAfterBytes: heapAfter,
    retainedDeltaBytes: heapAfter - heapBefore,
    note: "Coarse process-level signal without forced GC; compare only on the same runtime and host.",
  },
};

const output = resolve(root, process.env.HYPODOC_PERF_OUTPUT ?? "reports/rendering-audit-baseline.json");
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
