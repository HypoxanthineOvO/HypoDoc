import pytest

from hypolatex import document_options, themes


def source(tmp_path, metadata):
    path = tmp_path / "document.md"
    path.write_text(f"---\n{metadata}\n---\n\n# 正文\n", encoding="utf-8")
    return path


@pytest.mark.parametrize("profile", ["book", "article", "beamer"])
def test_canonical_profiles(tmp_path, profile):
    options = document_options.resolve_document_options(source(tmp_path, f"profile: {profile}"))
    assert options.document_type == profile
    assert options.answer_mode == "student"


def test_cli_answer_mode_overrides_document(tmp_path):
    path = source(tmp_path, "profile: article\nanswer_mode: student")
    assert document_options.resolve_document_options(path, answer_mode="review").answer_mode == "review"


@pytest.mark.parametrize("metadata", [
    "profile: invalid", "profile: book\ndocument_type: article",
    "answer_mode: invalid", "layout: invalid", "profile: beamer\naspectratio: invalid",
    "profile: beamer\npalette: invalid", "profile: beamer\nfootline: invalid",
])
def test_invalid_configuration_fails_early(tmp_path, metadata):
    with pytest.raises(document_options.DocumentOptionsError):
        document_options.resolve_document_options(source(tmp_path, metadata))


@pytest.mark.parametrize("profile,theme", [("book", "minimal"), ("beamer", "classic-readable")])
def test_incompatible_theme_does_not_silently_fall_back(tmp_path, profile, theme):
    path = source(tmp_path, f"profile: {profile}\ntheme: {theme}")
    with pytest.raises(themes.ThemeError):
        themes.resolve_theme(path, document_type=profile)


def test_invalid_theme_reports_error_without_pandoc(tmp_path, runner, cli_app, monkeypatch):
    monkeypatch.setenv("PATH", "")
    path = source(tmp_path, "profile: article\ntheme: no-such-theme")
    output = tmp_path / "output.tex"
    result = runner.invoke(cli_app, ["convert", str(path), "--output", str(output)])
    assert result.exit_code != 0
    assert "no-such-theme" in result.output
    assert not output.exists()
