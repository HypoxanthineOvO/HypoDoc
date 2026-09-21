"""Typer command line interface for Hypo-LaTeX."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated
from dataclasses import asdict
from importlib.metadata import version as package_version
import json

import typer

from hypolatex import build as build_module
from hypolatex import convert as convert_module
from hypolatex import doctor as doctor_module
from hypolatex import starter
from hypolatex import themes as themes_module


app = typer.Typer(
    help="Hypo-LaTeX command line tools for conversion, builds, and diagnostics.",
    no_args_is_help=True,
)


@app.callback(invoke_without_command=True)
def main(version: Annotated[bool, typer.Option("--version", is_eager=True)] = False):
    if version:
        typer.echo(package_version("hypolatex"))
        raise typer.Exit()


@app.command("init")
def init_document(
    output: Annotated[Path, typer.Argument(help="New Markdown file; existing files are never overwritten.")],
    template: Annotated[str, typer.Option(help="document, article, slides, review, cheatsheet")] = "document",
    theme: Annotated[str | None, typer.Option(help="Optional compatible theme.")] = None,
    school_cover: Annotated[str | None, typer.Option(help="standard or diagonal (theme school)")] = None,
) -> None:
    """Create a ready-to-edit source file from an installed template."""
    try:
        target = starter.create(output, template, theme, school_cover)
    except (OSError, ValueError, themes_module.ThemeError) as exc:
        typer.echo(str(exc), err=True)
        raise typer.Exit(1) from exc
    typer.echo(f"Created {target}")


@app.command("themes")
def list_themes() -> None:
    """List themes and supported document profiles."""
    for name, details in themes_module.THEME_REGISTRY.items():
        typer.echo(f"{name}: {', '.join(details['profiles'])}")


@app.command("doctor")
def doctor(
    target: Annotated[str, typer.Option(help="Operation to check: convert, build, evidence.")] = "build",
    json_output: Annotated[bool, typer.Option("--json", help="Machine-readable diagnostics.")] = False,
) -> None:
    """Check dependencies for an operation; optional tools do not block builds."""

    doctor_module.run(target, json_output)


@app.command("convert")
def convert(
    input_path: Annotated[
        Path,
        typer.Argument(
            exists=True,
            file_okay=True,
            dir_okay=False,
            readable=True,
            help="HypoDoc Markdown input file.",
        ),
    ],
    output: Annotated[
        Path | None,
        typer.Option(
            "--output",
            "-o",
            file_okay=True,
            dir_okay=False,
            writable=True,
            help="LaTeX output file.",
        ),
    ] = None,
    theme: Annotated[
        str | None,
        typer.Option(
            "--theme",
            help="Theme preset ID. Overrides the Markdown frontmatter theme.",
        ),
    ] = None,
    answer_mode: Annotated[
        str | None,
        typer.Option(
            "--answer-mode",
            help=(
                "Answer visibility mode: student, review, or teacher. "
                "Overrides the Markdown frontmatter answer_mode."
            ),
        ),
    ] = None,
    school_cover: Annotated[str | None, typer.Option(help="standard or diagonal (theme school)")] = None,
) -> None:
    """Convert HypoDoc Markdown to a standalone LaTeX document."""

    try:
        convert_module.convert_markdown(
            input_path, output or input_path.with_suffix(".tex"), theme=theme, answer_mode=answer_mode,
            school_cover=school_cover,
        )
    except convert_module.ConversionError as exc:
        typer.echo(str(exc), err=True)
        raise typer.Exit(code=1) from exc
    typer.echo(f"Generated {output or input_path.with_suffix('.tex')}")


@app.command("build")
def build(
    input_path: Annotated[
        Path,
        typer.Argument(
            exists=True,
            file_okay=True,
            dir_okay=False,
            readable=True,
            help="HypoDoc Markdown input file.",
        ),
    ],
    output: Annotated[
        Path | None,
        typer.Option(
            "--output",
            "-o",
            file_okay=True,
            dir_okay=False,
            writable=True,
            help="PDF output file.",
        ),
    ] = None,
    paper: Annotated[
        str,
        typer.Option(
            "--paper",
            help="Paper size for the generated PDF: a4paper or letterpaper.",
        ),
    ] = build_module.DEFAULT_PAPER,
    theme: Annotated[
        str | None,
        typer.Option(
            "--theme",
            help="Theme preset ID. Overrides the Markdown frontmatter theme.",
        ),
    ] = None,
    answer_mode: Annotated[
        str | None,
        typer.Option(
            "--answer-mode",
            help=(
                "Answer visibility mode: student, review, or teacher. "
                "Overrides the Markdown frontmatter answer_mode."
            ),
        ),
    ] = None,
    allow_placeholders: Annotated[
        bool,
        typer.Option(
            "--allow-placeholders",
            help="Allow missing local assets to render as explicit PDF placeholders.",
        ),
    ] = False,
    school_cover: Annotated[str | None, typer.Option(help="standard or diagonal (theme school)")] = None,
    strict: Annotated[bool, typer.Option(help="Fail on overflow or missing glyphs; preserve existing output.")] = False,
    json_output: Annotated[bool, typer.Option("--json", help="Machine-readable result and warnings.")] = False,
) -> None:
    """Convert HypoDoc Markdown and compile a PDF with XeLaTeX."""

    try:
        result = build_module.build_pdf(
            input_path,
            output or input_path.with_suffix(".pdf"),
            paper=paper,
            theme=theme,
            answer_mode=answer_mode,
            allow_placeholders=allow_placeholders,
            school_cover=school_cover, strict=strict,
        )
    except (build_module.BuildError, convert_module.ConversionError) as exc:
        if json_output:
            typer.echo(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        else:
            typer.echo(str(exc), err=True)
        raise typer.Exit(code=1) from exc
    if json_output:
        typer.echo(json.dumps({"ok": True, **asdict(result)}, default=str, ensure_ascii=False))
    else:
        typer.echo(f"Generated {result.output_path}")
        for diagnostic in result.diagnostics:
            location = f" [{diagnostic.frame_title}]" if diagnostic.frame_title else ""
            typer.echo(f"WARNING {diagnostic.code}{location}: {diagnostic.message}", err=True)
