import type { HighlighterCore } from "shiki/core";

const aliases: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  md: "markdown",
  mdx: "markdown",
  sh: "bash",
  shell: "bash",
  py: "python",
  yml: "yaml",
  xml: "html",
};

const supported = new Set(["typescript", "javascript", "json", "markdown", "bash", "python", "yaml", "html", "css"]);
let highlighterPromise: Promise<HighlighterCore> | null = null;

export function supportedLanguage(language: string): string | null {
  const normalized = aliases[language.toLowerCase()] ?? language.toLowerCase();
  return supported.has(normalized) ? normalized : null;
}

async function highlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("@shikijs/themes/github-light"),
      import("@shikijs/themes/github-dark"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/markdown"),
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/python"),
      import("@shikijs/langs/yaml"),
      import("@shikijs/langs/html"),
      import("@shikijs/langs/css"),
    ]).then(([core, engine, light, dark, ...languages]) =>
      core.createHighlighterCore({
        engine: engine.createJavaScriptRegexEngine(),
        themes: [light.default, dark.default],
        langs: languages.map((language) => language.default),
      }),
    );
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, language: string): Promise<string | null> {
  const resolved = supportedLanguage(language);
  if (!resolved) return null;
  const instance = await highlighter();
  return instance.codeToHtml(code, {
    lang: resolved,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
