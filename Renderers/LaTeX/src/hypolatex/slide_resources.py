"""Validated settings and portable, content-addressed slide resource exports."""

from dataclasses import dataclass
import hashlib
from pathlib import Path
import shutil
import tempfile

from hypolatex.configuration import ConfigurationError, load_frontmatter, optional_scalar

ROOT = Path(__file__).resolve().parent / "resources" / "slides"


@dataclass(frozen=True)
class SlideSettings:
    school_cover: str = "standard"
    font_preset: str = "preferred"


def settings(source: Path, school_cover: str | None = None) -> SlideSettings:
    metadata = load_frontmatter(source)
    cover = school_cover if school_cover is not None else (optional_scalar(metadata, "school_cover") or "standard")
    fonts = optional_scalar(metadata, "font_preset") or "preferred"
    if cover not in {"standard", "diagonal"}:
        raise ConfigurationError("school_cover must be standard or diagonal.")
    if fonts not in {"preferred", "portable"}:
        raise ConfigurationError("font_preset must be preferred or portable.")
    return SlideSettings(cover, fonts)


def export(parent: Path, theme: str | None = None) -> Path:
    """Never replace a user's existing resource folder or follow its symlinks."""
    if theme is None:
        files = sorted(p for p in ROOT.rglob("*") if p.is_file())
    else:
        selected = {
            "school": ["FZU_Beamer.sty", "assets/logo-red.pdf", "assets/logo-white.pdf"],
            "simple": ["assets/simple-background.pdf"],
            "nature": ["assets/nature-cover.png", "assets/nature-geometric.pdf"],
        }
        if theme not in selected:
            raise ValueError(f"No packaged resources for {theme}")
        names = [f"{theme}.tex", "fonts.tex", "semantics.tex", "hypolatex-pandoc.sty",
                 "NOTICE.md", "CC-BY-4.0.txt", *selected[theme]]
        files = sorted(ROOT / name for name in names)
    digest = hashlib.sha256()
    for path in files:
        digest.update(path.relative_to(ROOT).as_posix().encode() + b"\0")
        digest.update(path.read_bytes())
    target = parent / ("hypodoc-resources-" + digest.hexdigest()[:16])
    if target.is_symlink():
        raise ValueError(f"Refusing resource directory symlink: {target}")
    if target.exists():
        expected = {p.relative_to(ROOT) for p in files}
        actual = {p.relative_to(target) for p in target.rglob("*") if p.is_file() or p.is_symlink()}
        if actual != expected:
            raise ValueError(f"Resource directory was modified: {target}")
        for path in files:
            existing = target / path.relative_to(ROOT)
            if any(part.is_symlink() for part in (existing, *existing.parents) if part != parent):
                raise ValueError(f"Refusing modified resource path: {existing}")
            if not existing.is_file() or existing.read_bytes() != path.read_bytes():
                raise ValueError(f"Resource directory was modified; move it aside before retrying: {target}")
        return target
    with tempfile.TemporaryDirectory(prefix=".hypodoc-resources-", dir=parent) as staging:
        ready = Path(staging) / "payload"
        ready.mkdir()
        for path in files:
            destination = ready / path.relative_to(ROOT)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, destination)
        try:
            ready.rename(target)
        except OSError:
            if target.exists():
                return export(parent, theme)
            raise
    return target
