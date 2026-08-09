from __future__ import annotations

from pathlib import Path

import pytest

from hypolatex import resource_files


def test_resource_resolution_rejects_parent_escape_and_absolute_path(tmp_path):
    root = tmp_path / "document"
    root.mkdir()
    outside = tmp_path / "outside.png"
    outside.write_bytes(b"outside")

    assert resource_files._resolve_resource("../outside.png", (root,)) is None
    assert resource_files._resolve_resource(str(outside), (root,)) is None


def test_resource_resolution_rejects_symlink_escape(tmp_path):
    root = tmp_path / "document"
    root.mkdir()
    outside = tmp_path / "outside.png"
    outside.write_bytes(b"outside")
    (root / "linked.png").symlink_to(outside)

    assert resource_files._resolve_resource("linked.png", (root,)) is None


def test_corrupt_png_fails_instead_of_becoming_placeholder(tmp_path):
    source = tmp_path / "corrupt.png"
    source.write_bytes(b"not a png")
    destination = tmp_path / "output" / "corrupt.png"

    with pytest.raises(resource_files.ResourceError, match="Invalid PNG"):
        resource_files._copy_resource(source, destination)

    assert not destination.exists()


def test_missing_resource_requires_explicit_placeholder_opt_in(tmp_path, monkeypatch):
    source = tmp_path / "document.md"
    source.write_text("# Title\n", encoding="utf-8")
    output = tmp_path / "output"
    monkeypatch.setattr(
        resource_files,
        "_markdown_resource_references",
        lambda _source: ("images/missing.png",),
    )

    with pytest.raises(resource_files.ResourceError, match="missing.png"):
        resource_files.prepare_markdown_resources(source, output)

    result = resource_files.prepare_markdown_resources(
        source, output, allow_missing=True
    )
    assert result.missing == ("images/missing.png",)


def test_beamer_template_clears_missing_date_for_deterministic_builds():
    template = (
        Path(__file__).resolve().parents[1]
        / "src/hypolatex/resources/templates/hypolatex-beamer.tex"
    ).read_text(encoding="utf-8")

    assert "$else$\\date{}" in template


def test_lua_filter_validates_all_path_metadata_fields():
    filter_text = (
        Path(__file__).resolve().parents[1]
        / "src/hypolatex/resources/filters/hypolatex.lua"
    ).read_text(encoding="utf-8")

    assert "safe_resource_metadata" in filter_text
    assert "cover_image" in filter_text
    assert "\\\\detokenize{" in filter_text
