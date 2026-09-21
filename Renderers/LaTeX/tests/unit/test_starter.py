import pytest
from hypolatex import starter


@pytest.mark.parametrize("template", starter.TEMPLATES)
def test_installed_templates_need_no_external_tools(tmp_path, monkeypatch, template):
    monkeypatch.setenv("PATH", "")
    target = starter.create(tmp_path / "new.md", template)
    assert "profile:" in target.read_text()


def test_existing_source_is_never_overwritten(tmp_path):
    path = tmp_path / "existing.md"
    path.write_text("my content")
    with pytest.raises(FileExistsError):
        starter.create(path)
    assert path.read_text() == "my content"


def test_school_cover_and_profile_are_validated(tmp_path):
    with pytest.raises(ValueError):
        starter.create(tmp_path / "no.md", "slides", "simple", "diagonal")
    target = starter.create(tmp_path / "yes.md", "slides", "school", "diagonal")
    assert "school_cover: diagonal" in target.read_text()


def test_init_cli_defaults_and_build_help(runner, cli_app, tmp_path):
    target = tmp_path / "deck.md"
    result = runner.invoke(cli_app, ["init", str(target), "--template", "slides", "--theme", "school"])
    assert result.exit_code == 0, result.output
    assert "theme: school" in target.read_text()
    assert runner.invoke(cli_app, ["build", "--help"]).exit_code == 0
