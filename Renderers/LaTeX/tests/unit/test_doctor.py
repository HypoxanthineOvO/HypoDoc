import json
import subprocess

import pytest

from hypolatex import diagnostics


@pytest.mark.parametrize("version", ["3.1.3", "3.10", "3.99", "4.0"])
def test_version_number_does_not_reject_working_filter(monkeypatch, version):
    calls = []

    def run(command, **kwargs):
        calls.append(command)
        text = f"pandoc {version}\n" if "--version" in command else "HypoDocProbe"
        return subprocess.CompletedProcess(command, 0, text, "")

    monkeypatch.setattr(diagnostics.subprocess, "run", run)
    result = diagnostics.check_pandoc("/tools/pandoc")
    assert result.ok
    assert len(calls) == 2
    assert any(arg.startswith("--lua-filter=") for arg in calls[1])
    assert bool(result.warning) == (version not in diagnostics.TESTED_PANDOC_VERSIONS)


def test_broken_filter_fails_even_at_reference_version(monkeypatch):
    def run(command, **kwargs):
        if "--version" in command:
            return subprocess.CompletedProcess(command, 0, "pandoc 3.10\n", "")
        return subprocess.CompletedProcess(command, 1, "", "Lua unavailable")

    monkeypatch.setattr(diagnostics.subprocess, "run", run)
    result = diagnostics.check_pandoc("pandoc")
    assert not result.ok
    assert "Lua unavailable" in result.detail


@pytest.mark.parametrize("error", [OSError("cannot execute"), subprocess.TimeoutExpired("pandoc", 15)])
def test_unusable_executable_returns_diagnostic(monkeypatch, error):
    def run(*args, **kwargs):
        raise error

    monkeypatch.setattr(diagnostics.subprocess, "run", run)
    result = diagnostics.check_pandoc("pandoc")
    assert not result.ok
    assert result.remediation


def fake_checks(monkeypatch, missing=()):
    def check(name):
        return diagnostics.CheckResult(name, name not in missing, name)
    for name in ["check_executable", "check_tex_package", "check_font_family", "check_pdf_evidence_tool"]:
        monkeypatch.setattr(diagnostics, name, check)


def test_convert_does_not_require_tex_fonts_or_pdf_tools(monkeypatch):
    fake_checks(monkeypatch)
    report = diagnostics.collect_doctor_report("convert")
    assert report.ok
    assert [r.name for r in report.required] == ["pandoc"]
    assert report.optional == ()


def test_optional_tools_do_not_block_pdf_build(monkeypatch):
    fake_checks(monkeypatch, {"pdfinfo", "pdftotext", "pdftoppm", "fontawesome5", *diagnostics.RECOMMENDED_CJK_FONTS})
    report = diagnostics.collect_doctor_report("build")
    assert report.ok
    assert any(not result.ok for result in report.optional)
    assert not {"uv", "python3", "fc-match"} & {r.name for r in report.required}


def test_missing_tex_tool_blocks_build(monkeypatch):
    fake_checks(monkeypatch, {"latexmk"})
    assert not diagnostics.collect_doctor_report("build").ok


def test_evidence_only_needs_poppler(monkeypatch):
    fake_checks(monkeypatch, {"pandoc", "latexmk", "xelatex"})
    assert diagnostics.collect_doctor_report("evidence").ok
    fake_checks(monkeypatch, {"pdftotext"})
    assert not diagnostics.collect_doctor_report("evidence").ok


@pytest.mark.parametrize("missing,exit_code", [((), 0), (("latexmk",), 1)])
def test_cli_json_is_parseable_on_success_and_failure(monkeypatch, runner, cli_app, missing, exit_code):
    fake_checks(monkeypatch, missing)
    result = runner.invoke(cli_app, ["doctor", "--json"])
    assert result.exit_code == exit_code
    report = json.loads(result.stdout)
    assert report["ok"] == (exit_code == 0)
    assert report["target"] == "build"


def test_invalid_target_is_usage_error(runner, cli_app):
    result = runner.invoke(cli_app, ["doctor", "--target", "unknown"])
    assert result.exit_code == 2
