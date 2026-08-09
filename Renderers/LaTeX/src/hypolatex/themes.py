"""Theme preset resolution for Hypo-LaTeX documents."""

from __future__ import annotations

from pathlib import Path

from hypolatex.configuration import ConfigurationError, load_frontmatter, optional_scalar


class ThemeError(ValueError):
    """Raised when a document or CLI option selects an unsupported theme."""


DEFAULT_THEME = "plain"
THEME_REGISTRY = {
    "plain": {
        "latex_theme": "plain",
        "profiles": ("book", "article", "beamer"),
    },
    "classic-readable": {
        "latex_theme": "classic-readable",
        "profiles": ("book", "article"),
    },
    "tech-minimal": {
        "latex_theme": "tech-minimal",
        "profiles": ("book", "article"),
    },
    "warm-handbook": {
        "latex_theme": "warm-handbook",
        "profiles": ("book", "article"),
    },
    "academic-clean": {
        "latex_theme": "academic-clean",
        "profiles": ("book", "article"),
    },
    # Beamer-only themes; no longform style packages exist for them yet.
    "shanghaitech": {
        "latex_theme": "shanghaitech",
        "profiles": ("beamer",),
    },
    "minimal": {
        "latex_theme": "minimal",
        "profiles": ("beamer",),
    },
    "glass": {
        "latex_theme": "glass",
        "profiles": ("beamer",),
    },
}

def valid_theme_ids(document_type: str | None = None) -> tuple[str, ...]:
    """Return all supported public theme IDs."""

    return tuple(
        sorted(
            theme_id
            for theme_id, config in THEME_REGISTRY.items()
            if document_type is None or document_type in config["profiles"]
        )
    )


def validate_theme_id(theme_id: str, document_type: str | None = None) -> str:
    """Normalize and validate a public theme ID."""

    normalized = theme_id.strip()
    if normalized in THEME_REGISTRY and (
        document_type is None
        or document_type in THEME_REGISTRY[normalized]["profiles"]
    ):
        return normalized

    supported = ", ".join(valid_theme_ids(document_type))
    target = "" if document_type is None else f" for profile {document_type!r}"
    raise ThemeError(
        f"Unsupported theme{target}: {theme_id!r}. Use one of: {supported}."
    )


def resolve_theme(
    input_path: Path | str,
    override: str | None = None,
    document_type: str | None = None,
) -> str:
    """Resolve the effective theme from CLI override or YAML frontmatter."""

    if override is not None:
        return validate_theme_id(override, document_type)

    source = Path(input_path).expanduser().resolve()
    try:
        theme_id = optional_scalar(load_frontmatter(source), "theme")
    except ConfigurationError as exc:
        raise ThemeError(str(exc)) from exc
    if theme_id is None:
        return DEFAULT_THEME
    return validate_theme_id(theme_id, document_type)
