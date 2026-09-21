"""Keep compiler warnings observable even when latexmk exits successfully."""
from dataclasses import dataclass
import re


@dataclass(frozen=True)
class BuildDiagnostic:
    code: str
    message: str
    tex_line: int | None = None
    frame_title: str | None = None


def collect(log: str, tex: str) -> tuple[BuildDiagnostic, ...]:
    frames = []
    for line, text in enumerate(tex.splitlines(), 1):
        match = re.search(r"\\begin\{frame\}(?:\[[^]]*\])?\{(.+)\}", text)
        if match:
            frames.append((line, match[1]))
    results = []
    for raw in log.splitlines():
        if raw.startswith("Overfull "):
            location = re.search(r"(?:at lines? |line )(\d+)", raw)
            line = int(location[1]) if location else None
            frame = next((title for start, title in reversed(frames) if line and start <= line), None)
            results.append(BuildDiagnostic("LAYOUT_OVERFLOW", raw, line, frame))
        elif raw.startswith("Missing character:"):
            results.append(BuildDiagnostic("MISSING_GLYPH", raw))
        elif raw.startswith("HYPODOC-FONT-FALLBACK:"):
            results.append(BuildDiagnostic("FONT_FALLBACK", raw.split(":", 1)[1].strip()))
        elif raw.startswith("LaTeX Font Warning:"):
            results.append(BuildDiagnostic("FONT_WARNING", raw))
    return tuple(dict.fromkeys(results))
