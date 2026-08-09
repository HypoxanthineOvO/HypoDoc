"""Structured YAML frontmatter loading shared by renderer configuration."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Mapping

import yaml


class ConfigurationError(ValueError):
    """Raised when document frontmatter is malformed or has the wrong shape."""


def load_frontmatter(input_path: Path | str) -> dict[str, Any]:
    """Load a leading YAML mapping without interpreting renderer semantics."""

    source = Path(input_path).expanduser().resolve()
    text = source.read_text(encoding="utf-8")
    frontmatter, _ = split_frontmatter(text)
    return frontmatter


def split_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    """Return structured frontmatter and the untouched Markdown body."""

    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return {}, text

    for index, line in enumerate(lines[1:], start=1):
        if line.strip() not in {"---", "..."}:
            continue
        yaml_text = "".join(lines[1:index])
        try:
            loaded = yaml.safe_load(yaml_text)
        except yaml.YAMLError as exc:
            raise ConfigurationError(f"Invalid YAML frontmatter: {exc}") from exc
        if loaded is None:
            metadata: dict[str, Any] = {}
        elif isinstance(loaded, dict) and all(isinstance(key, str) for key in loaded):
            metadata = dict(loaded)
        else:
            raise ConfigurationError("YAML frontmatter must be a string-keyed mapping.")
        return metadata, "".join(lines[index + 1 :])

    raise ConfigurationError("YAML frontmatter is not closed.")


def optional_scalar(metadata: Mapping[str, Any], key: str) -> str | None:
    """Return one scalar as text and reject nested/list configuration values."""

    value = metadata.get(key)
    if value is None:
        return None
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (str, int, float)):
        return str(value).strip()
    raise ConfigurationError(f"Frontmatter field {key!r} must be a scalar value.")
