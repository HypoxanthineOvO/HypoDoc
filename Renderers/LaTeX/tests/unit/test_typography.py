import pytest

from hypolatex import typography, resource_files
from hypolatex.configuration import ConfigurationError


def source(tmp_path, metadata):
    path = tmp_path / "input.md"
    path.write_text(f"---\n{metadata}\n---\n\n正文\n", encoding="utf-8")
    return path


def test_font_color_spacing_and_paper_are_wired(tmp_path):
    result = typography.resolve(source(tmp_path, "mainfont: TeX Gyre Pagella\ncjkfont: Noto Serif CJK SC\naccent: '#286759'\npaper: letter\nbox_density: comfortable\nline_stretch: 1.2\ntoc: false"))
    assert result.paper == "letterpaper"
    assert r"\HypoSetFont{main}{TeX Gyre Pagella}" in result.commands
    assert r"\HypoSetFont{cjk}{Noto Serif CJK SC}" in result.commands
    assert r"\definecolor{HypoAccent}{HTML}{286759}" in result.commands
    assert r"\HypoSetBoxDensity{comfortable}" in result.commands
    assert r"\renewcommand{\HypoShowTOC}{false}" in result.commands


def test_paper_cli_has_priority(tmp_path):
    assert typography.resolve(source(tmp_path, "paper: letter"), "a4").paper == "a4paper"


@pytest.mark.parametrize("metadata,title,toc", [
    ("profile: article", "inline", "false"),
    ("profile: book", "cover", "true"),
    ("document_type: short", "inline", "false"),
    ("profile: article\ncover: true", "cover", "false"),
    ("profile: article\ncover: false\ntoc: true", "inline", "true"),
    ("profile: book\ncover: false", "none", "true"),
    ("profile: article\ntitle_layout: none", "none", "false"),
])
def test_profile_specific_startup(tmp_path, metadata, title, toc):
    settings = typography.resolve(source(tmp_path, metadata))
    assert f"\\renewcommand{{\\HypoTitleLayout}}{{{title}}}" in settings.commands
    assert f"\\renewcommand{{\\HypoShowTOC}}{{{toc}}}" in settings.commands


@pytest.mark.parametrize("metadata", [
    "title_layout: arbitrary", "title_layout: inline\ncover: true",
    "title_layout: cover\ncover: false", "cover_layout: artwork",
])
def test_invalid_startup_configuration(tmp_path, metadata):
    with pytest.raises(ConfigurationError):
        typography.resolve(source(tmp_path, metadata))


@pytest.mark.parametrize("metadata", [
    "mainfont: 'Bad\\input{x}'", "mainfont: ['Noto']", "accent: 'red'",
    "accent: '#000000}evil'", "fontsize: 1pt", "line_stretch: 0.5",
    "line_stretch: nan", "box_density: tiny", "cover: maybe", "toc: 1",
    "cover_layout: not-a-cover", "paper: a3",
])
def test_invalid_typography_fails_closed(tmp_path, metadata):
    with pytest.raises(ConfigurationError):
        typography.resolve(source(tmp_path, metadata))


def test_local_resource_root_is_resolved(tmp_path):
    assets = tmp_path / "assets"
    assets.mkdir()
    path = source(tmp_path, "resource-root: assets")
    assert resource_files._resource_roots(path, ())[0] == assets


@pytest.mark.parametrize("root", ["../outside", "https://example.com/assets", "/tmp", "missing"])
def test_invalid_resource_root_is_rejected(tmp_path, root):
    with pytest.raises(resource_files.ResourceError):
        resource_files._resource_roots(source(tmp_path, f"resource-root: {root}"), ())
