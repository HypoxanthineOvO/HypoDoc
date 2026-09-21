"""Start a document without requiring a clone, Pandoc or a TeX installation."""
from importlib import resources
from pathlib import Path

import yaml

from hypolatex.configuration import split_frontmatter
from hypolatex.themes import validate_theme_id

TEMPLATES = {
    "document": "longform.md", "article": "project.md", "slides": "beamer.md",
    "review": "review.md", "cheatsheet": "cheatsheet.md",
}


def create(output: Path, template: str = "document", theme: str | None = None,
           school_cover: str | None = None) -> Path:
    if template not in TEMPLATES:
        raise ValueError("Choose a template: " + ", ".join(TEMPLATES))
    text = resources.files("hypolatex").joinpath("resources", "starters", TEMPLATES[template]).read_text(encoding="utf-8")
    metadata, body = split_frontmatter(text)
    if theme is not None:
        metadata["theme"] = validate_theme_id(theme, metadata["profile"])
    if school_cover is not None:
        if metadata.get("theme") != "school" or school_cover not in {"standard", "diagonal"}:
            raise ValueError("--school-cover requires theme school and standard or diagonal.")
        metadata["school_cover"] = school_cover
    target = output.expanduser()
    target.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation protects both existing files and symlinks.
    with target.open("x", encoding="utf-8") as handle:
        handle.write("---\n" + yaml.safe_dump(metadata, allow_unicode=True, sort_keys=False) + "---\n" + body)
    return target.resolve()
