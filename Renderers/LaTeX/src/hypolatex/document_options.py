"""Document option resolution for Hypo-LaTeX documents."""

from __future__ import annotations

from collections.abc import Iterator, Mapping
from dataclasses import dataclass
from pathlib import Path

from hypolatex.configuration import ConfigurationError, load_frontmatter, optional_scalar


class DocumentOptionsError(ValueError):
    """Raised when a document option is unsupported or malformed."""


DEFAULT_ANSWER_MODE = "student"
SUPPORTED_ANSWER_MODES = ("student", "review", "teacher")
DEFAULT_DOCUMENT_TYPE = "book"
SUPPORTED_DOCUMENT_TYPES = ("book", "article", "beamer")
DEFAULT_LAYOUT = "standard"
SUPPORTED_LAYOUTS = ("standard", "cheatsheet")
DEFAULT_BEAMER_PALETTE = "red"
SUPPORTED_BEAMER_PALETTES = ("red", "blue", "yellow", "gray", "mono")
DEFAULT_BEAMER_ASPECTRATIO = "169"
SUPPORTED_BEAMER_ASPECTRATIOS = ("43", "54", "149", "1610", "169", "32")
DEFAULT_BEAMER_FOOTLINE = "full"
SUPPORTED_BEAMER_FOOTLINES = ("full", "page", "none")

@dataclass(frozen=True)
class DocumentOptions(Mapping[str, str]):
    """Resolved document options.

    The mapping interface keeps this object convenient for tests and callers
    that prefer dictionary-like access while preserving named attributes for
    the public options. Beamer-only options are present in the mapping only
    when ``document_type`` resolves to ``beamer``.
    """

    answer_mode: str = DEFAULT_ANSWER_MODE
    document_type: str = DEFAULT_DOCUMENT_TYPE
    layout: str = DEFAULT_LAYOUT
    palette: str | None = None
    aspectratio: str | None = None
    footline: str | None = None
    logo: str | None = None

    def __getitem__(self, key: str) -> str | None:
        if key == "answer_mode":
            return self.answer_mode
        if key == "document_type":
            return self.document_type
        if key == "layout":
            return self.layout
        if self.document_type == "beamer":
            if key == "palette":
                return self.palette
            if key == "aspectratio":
                return self.aspectratio
            if key == "footline":
                return self.footline
            if key == "logo":
                return self.logo
        raise KeyError(key)

    def __iter__(self) -> Iterator[str]:
        yield "answer_mode"
        yield "document_type"
        yield "layout"
        if self.document_type == "beamer":
            yield "palette"
            yield "aspectratio"
            yield "footline"
            yield "logo"

    def __len__(self) -> int:
        if self.document_type == "beamer":
            return 7
        return 3


def valid_answer_modes() -> tuple[str, ...]:
    """Return all supported answer visibility modes."""

    return SUPPORTED_ANSWER_MODES


def valid_document_types() -> tuple[str, ...]:
    """Return supported document shape presets."""

    return SUPPORTED_DOCUMENT_TYPES


def valid_layouts() -> tuple[str, ...]:
    """Return supported document startup layouts."""

    return SUPPORTED_LAYOUTS


def valid_beamer_palettes() -> tuple[str, ...]:
    """Return supported Beamer palette presets."""

    return SUPPORTED_BEAMER_PALETTES


def valid_beamer_aspectratios() -> tuple[str, ...]:
    """Return supported Beamer aspect ratios."""

    return SUPPORTED_BEAMER_ASPECTRATIOS


def valid_beamer_footlines() -> tuple[str, ...]:
    """Return supported Beamer footline presets."""

    return SUPPORTED_BEAMER_FOOTLINES


def validate_answer_mode(answer_mode: str) -> str:
    """Normalize and validate an answer visibility mode."""

    normalized = answer_mode.strip()
    if normalized in SUPPORTED_ANSWER_MODES:
        return normalized

    supported = ", ".join(SUPPORTED_ANSWER_MODES)
    raise DocumentOptionsError(
        f"Unsupported answer_mode: {answer_mode!r}. Use one of: {supported}."
    )


def validate_document_type(document_type: str) -> str:
    """Normalize and validate the document shape preset."""

    normalized = document_type.strip().lower()
    aliases = {
        "longform": "book",
        "tutorial": "book",
        "manual": "article",
        "handbook": "article",
        "handout": "article",
        "short": "article",
        "presentation": "beamer",
        "slides": "beamer",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized in SUPPORTED_DOCUMENT_TYPES:
        return normalized

    supported = ", ".join(SUPPORTED_DOCUMENT_TYPES)
    raise DocumentOptionsError(
        f"Unsupported document_type: {document_type!r}. Use one of: {supported}."
    )


def validate_layout(layout: str) -> str:
    """Normalize and validate the document startup layout."""

    normalized = layout.strip().lower()
    if normalized in SUPPORTED_LAYOUTS:
        return normalized

    supported = ", ".join(SUPPORTED_LAYOUTS)
    raise DocumentOptionsError(
        f"Unsupported layout: {layout!r}. Use one of: {supported}."
    )


def validate_beamer_palette(palette: str) -> str:
    """Normalize and validate a Beamer palette preset."""

    normalized = palette.strip().lower()
    if normalized in SUPPORTED_BEAMER_PALETTES:
        return normalized

    supported = ", ".join(SUPPORTED_BEAMER_PALETTES)
    raise DocumentOptionsError(
        f"Unsupported palette: {palette!r}. Use one of: {supported}."
    )


def validate_beamer_aspectratio(aspectratio: str) -> str:
    """Normalize and validate a Beamer aspect ratio option."""

    normalized = aspectratio.strip()
    if normalized in SUPPORTED_BEAMER_ASPECTRATIOS:
        return normalized

    supported = ", ".join(SUPPORTED_BEAMER_ASPECTRATIOS)
    raise DocumentOptionsError(
        f"Unsupported aspectratio: {aspectratio!r}. Use one of: {supported}."
    )


def validate_beamer_footline(footline: str) -> str:
    """Normalize and validate a Beamer footline preset."""

    normalized = footline.strip().lower()
    if normalized in SUPPORTED_BEAMER_FOOTLINES:
        return normalized

    supported = ", ".join(SUPPORTED_BEAMER_FOOTLINES)
    raise DocumentOptionsError(
        f"Unsupported footline: {footline!r}. Use one of: {supported}."
    )


def resolve_document_options(
    input_path: Path | str,
    answer_mode: str | None = None,
) -> DocumentOptions:
    """Resolve document options from CLI overrides and YAML frontmatter."""

    source = Path(input_path).expanduser().resolve()
    try:
        metadata = load_frontmatter(source)
        frontmatter_document_type = _document_type_value(metadata)
        frontmatter_layout = optional_scalar(metadata, "layout")
        frontmatter_answer_mode = optional_scalar(metadata, "answer_mode")
    except ConfigurationError as exc:
        raise DocumentOptionsError(str(exc)) from exc
    document_type = (
        DEFAULT_DOCUMENT_TYPE
        if frontmatter_document_type is None
        else validate_document_type(frontmatter_document_type)
    )
    layout = (
        DEFAULT_LAYOUT
        if frontmatter_layout is None
        else validate_layout(frontmatter_layout)
    )

    if answer_mode is not None:
        return DocumentOptions(
            answer_mode=validate_answer_mode(answer_mode),
            document_type=document_type,
            layout=layout,
            **_resolve_beamer_options(metadata, document_type),
        )

    return DocumentOptions(
        answer_mode=(
            DEFAULT_ANSWER_MODE
            if frontmatter_answer_mode is None
            else validate_answer_mode(frontmatter_answer_mode)
        ),
        document_type=document_type,
        layout=layout,
        **_resolve_beamer_options(metadata, document_type),
    )


def _document_type_value(metadata: Mapping[str, object]) -> str | None:
    canonical = optional_scalar(metadata, "profile")
    legacy_values = [
        value
        for key in ("document_type", "documentclass")
        if (value := optional_scalar(metadata, key)) is not None
    ]
    if canonical is not None and legacy_values:
        raise ConfigurationError(
            "Use canonical frontmatter field 'profile' without document_type/documentclass aliases."
        )
    if len(legacy_values) > 1 and len(set(legacy_values)) > 1:
        raise ConfigurationError("Conflicting document_type and documentclass aliases.")
    return canonical if canonical is not None else (legacy_values[0] if legacy_values else None)


def _resolve_beamer_options(
    metadata: Mapping[str, object], document_type: str
) -> dict[str, str | None]:
    if document_type != "beamer":
        return {}

    frontmatter_palette = optional_scalar(metadata, "palette")
    frontmatter_aspectratio = optional_scalar(metadata, "aspectratio")
    frontmatter_footline = optional_scalar(metadata, "footline")

    return {
        "palette": (
            DEFAULT_BEAMER_PALETTE
            if frontmatter_palette is None
            else validate_beamer_palette(frontmatter_palette)
        ),
        "aspectratio": (
            DEFAULT_BEAMER_ASPECTRATIO
            if frontmatter_aspectratio is None
            else validate_beamer_aspectratio(frontmatter_aspectratio)
        ),
        "footline": (
            DEFAULT_BEAMER_FOOTLINE
            if frontmatter_footline is None
            else validate_beamer_footline(frontmatter_footline)
        ),
        "logo": optional_scalar(metadata, "logo"),
    }
