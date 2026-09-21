"""Implementation for the `hypolatex doctor` command."""

from __future__ import annotations

from dataclasses import asdict
import json

import typer

from hypolatex.diagnostics import CheckResult, collect_doctor_report


def run(target: str = "build", json_output: bool = False) -> None:
    """Run local toolchain checks and exit non-zero on missing requirements."""

    try:
        report = collect_doctor_report(target)
    except ValueError as exc:
        raise typer.BadParameter(str(exc), param_hint="--target") from exc
    if json_output:
        typer.echo(json.dumps({"ok": report.ok, **asdict(report)}, ensure_ascii=False))
    else:
        typer.echo(f"Hypo-LaTeX doctor ({target})")
        _print_section("Required", report.required)
        if report.optional:
            _print_section("Optional (not required for this operation)", report.optional, optional=True)
        typer.echo("Ready. Build a sample to check its fonts and layout." if report.ok else
                   "Missing requirements. See Docs/installation.md for installation and troubleshooting.")
    if not report.ok:
        raise typer.Exit(code=1)


def _print_section(title: str, results: tuple[CheckResult, ...], optional: bool = False) -> None:
    typer.echo(f"{title}:")
    for result in results:
        status = "OK" if result.ok else ("OPTIONAL" if optional else "MISSING")
        typer.echo(f"  [{status}] {result.name}: {result.detail}")
        if result.remediation:
            typer.echo(f"        Action: {result.remediation}")
        if result.warning:
            typer.echo(f"        Note: {result.warning}")
