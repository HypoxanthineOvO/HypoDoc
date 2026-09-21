import json
from pathlib import Path
import subprocess

import pytest

from hypolatex import starter
from hypolatex.pdf_evidence import extract_text, read_pdf_info


@pytest.mark.parametrize("theme,cover", [("school", "standard"), ("school", "diagonal"), ("simple", None), ("nature", None)])
def test_public_entrypoint_with_portable_fonts(runner, cli_app, tmp_path, theme, cover):
    source = starter.create(tmp_path / "deck.md", "slides", theme, cover)
    source.write_text(source.read_text().replace("theme:", "font_preset: portable\ntheme:", 1))
    result = runner.invoke(cli_app, ["build", str(source), "--strict", "--json"])
    assert result.exit_code == 0, result.output
    report = json.loads(result.stdout)
    assert report["ok"]
    output = source.with_suffix(".pdf")
    assert int(read_pdf_info(output)["pages"]) == 4
    assert "核心观点" in extract_text(output)
    fonts = subprocess.check_output(["pdffonts", str(output)], text=True)
    assert "TimesNewRoman" not in fonts
    assert "CascadiaMono" not in fonts


def test_overflow_is_reported_and_strict_preserves_previous_output(runner, cli_app, tmp_path):
    source = tmp_path / "dense.md"
    source.write_text("---\nprofile: beamer\ntheme: simple\n---\n### Dense\n\n" +
                      "\n".join(f"- Item {i}: A statement that must remain readable." for i in range(30)))
    result = runner.invoke(cli_app, ["build", str(source), "--json"])
    assert result.exit_code == 0, result.output
    report = json.loads(result.stdout)
    assert any(d["code"] == "LAYOUT_OVERFLOW" for d in report["diagnostics"])
    output = source.with_suffix(".pdf")
    output.write_bytes(b"previous output")
    strict = runner.invoke(cli_app, ["build", str(source), "--strict", "--json"])
    assert strict.exit_code != 0
    assert not json.loads(strict.stdout)["ok"]
    assert output.read_bytes() == b"previous output"


def test_canonical_table_kind_and_id_reach_tex(runner, cli_app, tmp_path):
    source = tmp_path / "table.md"
    source.write_text('---\nprofile: beamer\ntheme: simple\n---\n### Comparison\n\n::: {.table #choices kind="comparison"}\n| A | B |\n|---|---|\n|one|two|\n:::\n')
    result = runner.invoke(cli_app, ["convert", str(source)])
    assert result.exit_code == 0, result.output
    tex = source.with_suffix(".tex").read_text()
    assert "type=comparison" in tex and "label={choices}" in tex
    assert "width=0.8\\linewidth" in tex
