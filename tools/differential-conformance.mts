import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { parseHypoDoc } from "../Packages/parser-core/src/index.ts";

const root = resolve(import.meta.dirname, "..");
const fixtureRoot = resolve(root, "Spec/fixtures");
const cases = [
  "m2/positive/code-pseudo-backtick.md",
  "m2/positive/code-pseudo-tilde.md",
  "m2/positive/indented-code-pseudo.md",
  "m2/positive/nested-variable-fences.md",
  "m2/positive/repeated-nodes.md",
  "m6/canonical/full-surface.md",
  "m2/negative/unclosed-fence.md",
  "m2/negative/nested-unknown-attributes.md",
  "m2/negative/malformed-yaml.md",
  "m2/negative/duplicate-metadata.md",
  "m6/negative/note-unknown-attribute.md",
  "m6/negative/figure-missing-src.md",
  "m6/negative/solution-outside-qa.md",
] as const;

function referenceValidate(path: string): Record<string, unknown> {
  const python = process.env.HYPODOC_PYTHON ?? resolve(root, "Spec/.venv/bin/python");
  const pandoc = process.env.HYPODOC_PANDOC ?? resolve(root, "Spec/.tools/pandoc/3.10/bin/pandoc");
  const result = spawnSync(
    resolve(root, "tools/hypodoc-reference"),
    ["validate", path, "--mode", "canonical", "--format", "json"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, HYPODOC_PYTHON: python, HYPODOC_PANDOC: pandoc },
    },
  );
  if (![0, 1, 2].includes(result.status ?? -1)) {
    throw new Error(`reference validation failed for ${path}: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

const results = cases.map((relative) => {
  const path = resolve(fixtureRoot, relative);
  const source = readFileSync(path, "utf8");
  const portable = parseHypoDoc(source);
  const reference = referenceValidate(path);
  const referenceDiagnostics = Array.isArray(reference.diagnostics)
    ? reference.diagnostics.map((item) =>
        typeof item === "object" && item !== null && "code" in item ? String(item.code) : "UNKNOWN",
      )
    : [];
  const referenceValid = reference.valid === true;
  return {
    fixture: relative,
    passed: portable.valid === referenceValid,
    reference: { valid: referenceValid, diagnostics: referenceDiagnostics },
    portable: {
      valid: portable.valid,
      profile: portable.profile,
      diagnostics: portable.diagnostics.map((item) => item.code),
      outline: portable.outline.map((item) => ({ depth: item.depth, text: item.text })),
    },
  };
});

const report = {
  protocol: "hypodoc.portable-differential/v1",
  reference: { spec: "0.2.0-rc.1", pandoc: "3.10", mode: "canonical" },
  portable: { protocol: "hypodoc.render-document/v1", runtime: "typescript" },
  caseCount: results.length,
  failureCount: results.filter((item) => !item.passed).length,
  cases: results,
};

mkdirSync(resolve(root, "reports"), { recursive: true });
writeFileSync(resolve(root, "reports/differential-conformance.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ protocol: report.protocol, cases: report.caseCount, failures: report.failureCount }));
if (report.failureCount) process.exitCode = 1;
