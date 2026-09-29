"""Validated, document-only presentation settings (never raw TeX input)."""
from dataclasses import dataclass
from pathlib import Path
import re

from hypolatex.configuration import ConfigurationError, load_frontmatter, optional_scalar
from hypolatex.document_options import resolve_document_options

FONT_FIELDS = {
    "mainfont": "main", "sansfont": "sans", "monofont": "mono",
    "cjkfont": "cjk", "titlefont": "title", "cjktitlefont": "cjktitle",
    "mathfont": "math",
}
COVER_LAYOUTS = {
    "plain", "full-bleed-card", "integrated-art", "top-title-image",
    "info-panel", "paper-ink", "notebook", "editorial", "artwork",
}


def normalize_paper(value: str) -> str:
    normalized = {"a4": "a4paper", "letter": "letterpaper"}.get(value.lower(), value.lower())
    if normalized not in {"a4paper", "letterpaper"}:
        raise ConfigurationError("paper must be a4 or letter.")
    return normalized


@dataclass(frozen=True)
class Typography:
    paper: str
    fontsize: str
    commands: tuple[str, ...]


def resolve(source: Path, paper: str | None = None, document_type: str | None = None) -> Typography:
    metadata = load_frontmatter(source)
    document_type = document_type or resolve_document_options(source).document_type
    commands: list[str] = []
    for field, role in FONT_FIELDS.items():
        value = optional_scalar(metadata, field)
        if value is None:
            continue
        if not re.fullmatch(r"[\w .()+-]{1,120}", value):
            raise ConfigurationError(f"{field} must be a font family name, not TeX or a file path.")
        commands.append(f"\\HypoSetFont{{{role}}}{{{value}}}")
    accent = optional_scalar(metadata, "accent")
    if accent is not None:
        if not re.fullmatch(r"#?[0-9a-fA-F]{6}", accent):
            raise ConfigurationError("accent must be a six-digit hex color, e.g. '#245B69'.")
        commands.append(f"\\definecolor{{HypoAccent}}{{HTML}}{{{accent.lstrip('#')}}}")
    fontsize = optional_scalar(metadata, "fontsize") or "11pt"
    if fontsize not in {"10pt", "11pt", "12pt"}:
        raise ConfigurationError("fontsize must be 10pt, 11pt or 12pt.")
    stretch = optional_scalar(metadata, "line_stretch")
    if stretch is not None:
        if not re.fullmatch(r"\d+(?:\.\d+)?", stretch) or not 1 <= float(stretch) <= 1.6:
            raise ConfigurationError("line_stretch must be between 1.0 and 1.6.")
        commands.append(f"\\AtBeginDocument{{\\linespread{{{stretch}}}\\selectfont}}")
    density = optional_scalar(metadata, "box_density")
    if density is not None:
        if density not in {"compact", "normal", "comfortable"}:
            raise ConfigurationError("box_density must be compact, normal or comfortable.")
        commands.append(f"\\HypoSetBoxDensity{{{density}}}")
    switches: dict[str, str] = {}
    for key in ("toc", "cover"):
        value = optional_scalar(metadata, key)
        if value is not None:
            if value not in {"true", "false"}:
                raise ConfigurationError(f"{key} must be true or false.")
            switches[key] = value
    title_layout = optional_scalar(metadata, "title_layout")
    if title_layout is not None and title_layout not in {"inline", "cover", "none"}:
        raise ConfigurationError("title_layout must be inline, cover or none.")
    if title_layout is not None and "cover" in switches:
        if (title_layout == "cover") != (switches["cover"] == "true"):
            raise ConfigurationError("title_layout conflicts with cover; use a single setting.")
    if title_layout is None:
        if switches.get("cover") == "true":
            title_layout = "cover"
        elif document_type == "article":
            title_layout = "inline"
        else:
            title_layout = "none" if switches.get("cover") == "false" else "cover"
    toc = switches.get("toc", "false" if document_type == "article" else "true")
    commands.extend((
        f"\\renewcommand{{\\HypoTitleLayout}}{{{title_layout}}}",
        f"\\renewcommand{{\\HypoShowTOC}}{{{toc}}}",
    ))
    cover = optional_scalar(metadata, "cover_layout")
    if cover is not None and cover not in COVER_LAYOUTS:
        raise ConfigurationError("Unsupported cover_layout: " + cover)
    if cover == "artwork" and not optional_scalar(metadata, "cover_image"):
        raise ConfigurationError("cover_layout: artwork requires cover_image.")
    return Typography(normalize_paper(paper or optional_scalar(metadata, "paper") or "a4"),
                      fontsize, tuple(commands))
