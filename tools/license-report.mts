import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const result = spawnSync("pnpm", ["licenses", "list", "--prod", "--json"], {
  cwd: root,
  encoding: "utf8",
});
if (result.status !== 0) throw new Error(result.stderr || "pnpm license inventory failed");

type InventoryItem = { name: string; versions: string[]; license: string; paths?: string[]; homepage?: string };
const grouped = JSON.parse(result.stdout) as Record<string, InventoryItem[]>;
const overrides: Array<{ name: string; version: string; detected: string; resolved: string; evidence: string }> = [];
const packages = Object.entries(grouped).flatMap(([license, entries]) =>
  entries.map((entry) => {
    let resolvedLicense = license;
    let evidence: string | undefined;
    if (entry.name === "khroma" && entry.versions.includes("2.1.0") && license === "Unknown") {
      const packageRoot = entry.paths?.[0];
      const licenseText = packageRoot ? readFileSync(resolve(packageRoot, "license"), "utf8") : "";
      if (!licenseText.startsWith("The MIT License (MIT)")) throw new Error("khroma license override evidence changed");
      resolvedLicense = "MIT";
      evidence = "installed package license file begins with The MIT License (MIT)";
      overrides.push({ name: entry.name, version: "2.1.0", detected: license, resolved: resolvedLicense, evidence });
    }
    return {
      name: entry.name,
      versions: entry.versions,
      license: resolvedLicense,
      homepage: entry.homepage ?? null,
      ...(evidence ? { evidence } : {}),
    };
  }),
).sort((left, right) => left.name.localeCompare(right.name));

const unresolved = packages.filter((item) => item.license === "Unknown");
const byLicense = packages.reduce<Record<string, typeof packages>>((groups, item) => {
  (groups[item.license] ??= []).push(item);
  return groups;
}, {});
const summary = Object.fromEntries(
  Object.entries(byLicense).map(([license, entries]) => [license, entries.length]).sort(),
);
const report = {
  protocol: "hypodoc.third-party-licenses/v1",
  source: "pnpm-lock.yaml production dependency closure",
  packageCount: packages.length,
  summary,
  overrides,
  unresolved,
  valid: unresolved.length === 0,
  packages,
};

mkdirSync(resolve(root, "reports"), { recursive: true });
writeFileSync(resolve(root, "reports/third-party-licenses.json"), `${JSON.stringify(report, null, 2)}\n`);
const rows = Object.entries(summary).map(([license, count]) => `| ${license} | ${count} |`).join("\n");
const markdown = `# Third-Party License Report\n\nGenerated from the production dependency closure in \`pnpm-lock.yaml\`.\n\n| License | Packages |\n|---|---:|\n${rows}\n\n## Metadata Overrides\n\n${overrides.map((item) => `- \`${item.name}@${item.version}\`: npm metadata reported \`${item.detected}\`; resolved to \`${item.resolved}\` because the ${item.evidence}.`).join("\n") || "None."}\n\nUnresolved license entries: **${unresolved.length}**.\n`;
writeFileSync(resolve(root, "reports/third-party-licenses.md"), markdown);
console.log(JSON.stringify({ protocol: report.protocol, packages: report.packageCount, unresolved: unresolved.length }));
if (!report.valid) process.exitCode = 1;
