import pytest
from hypolatex import slide_resources
from hypolatex.configuration import ConfigurationError


@pytest.mark.parametrize("field,value", [("school_cover", "wrong"), ("font_preset", "wrong")])
def test_invalid_slide_settings_rejected(tmp_path, field, value):
    source = tmp_path / "input.md"
    source.write_text(f"---\n{field}: {value}\n---\n")
    with pytest.raises(ConfigurationError):
        slide_resources.settings(source)


def test_resource_export_is_reused_but_never_overwrites_changes(tmp_path):
    directory = slide_resources.export(tmp_path)
    assert slide_resources.export(tmp_path) == directory
    (directory / "school.tex").write_text("user changes")
    with pytest.raises(ValueError, match="modified"):
        slide_resources.export(tmp_path)
    assert (directory / "school.tex").read_text() == "user changes"
