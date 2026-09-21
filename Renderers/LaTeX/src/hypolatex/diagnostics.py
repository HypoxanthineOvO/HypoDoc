"""Reusable local environment diagnostics for Hypo-LaTeX."""

from __future__ import annotations

from dataclasses import dataclass
from importlib import resources
import shutil
import subprocess


REQUIRED_EXECUTABLES = (
    "pandoc",
    "xelatex",
    "latexmk",
    "kpsewhich",
)

PDF_EVIDENCE_TOOLS = (
    "pdfinfo",
    "pdftotext",
    "pdftoppm",
)

REQUIRED_TEX_PACKAGES = (
    "ctex",
    "fontspec",
    "amssymb",
    "tcolorbox",
    "fancyhdr",
    "geometry",
    "titlesec",
    "eso-pic",
)

OPTIONAL_TEX_PACKAGES = (
    "fontawesome5",
)

RECOMMENDED_CJK_FONTS = (
    "Noto Serif CJK SC",
    "Noto Sans CJK SC",
    "Noto Sans Mono CJK SC",
)

# Observed compatibility, not an allowlist. Spec's reference pin is separate.
TESTED_PANDOC_VERSIONS = frozenset({"3.1.3", "3.10"})


@dataclass(frozen=True)
class CheckResult:
    """Result for one required executable or TeX package."""

    name: str
    ok: bool
    detail: str
    remediation: str = ""
    warning: str = ""


@dataclass(frozen=True)
class DoctorReport:
    """Collected doctor results."""

    target: str
    required: tuple[CheckResult, ...]
    optional: tuple[CheckResult, ...]

    @property
    def ok(self) -> bool:
        return all(result.ok for result in self.required)


def collect_doctor_report(target: str = "build") -> DoctorReport:
    """Check only the tools needed for the selected operation."""
    if target not in {"convert", "build", "evidence"}:
        raise ValueError("Choose a doctor target: convert, build, evidence.")
    if target == "evidence":
        return DoctorReport(target, tuple(check_pdf_evidence_tool(n) for n in PDF_EVIDENCE_TOOLS), ())
    executables = ("pandoc",) if target == "convert" else REQUIRED_EXECUTABLES
    required = [check_executable(name) for name in executables]
    optional: list[CheckResult] = []
    if target == "build":
        required.extend(check_tex_package(name) for name in REQUIRED_TEX_PACKAGES)
        optional.extend(check_tex_package(name) for name in OPTIONAL_TEX_PACKAGES)
        optional.extend(check_font_family(name) for name in RECOMMENDED_CJK_FONTS)
        optional.extend(check_pdf_evidence_tool(name) for name in PDF_EVIDENCE_TOOLS)
    return DoctorReport(target, tuple(required), tuple(optional))


def check_executable(name: str) -> CheckResult:
    """Return whether an executable can be found on PATH."""

    found = shutil.which(name)
    if found:
        if name == "pandoc":
            return check_pandoc(found)
        return CheckResult(name=name, ok=True, detail=found)

    return CheckResult(
        name=name,
        ok=False,
        detail=f"{name} was not found on PATH.",
        remediation=f"Install {name} and ensure it is available on PATH.",
    )


def check_pandoc(executable: str) -> CheckResult:
    """Exercise the shipped Lua filter instead of rejecting a version number."""
    try:
        version = subprocess.run([executable, "--version"], capture_output=True,
                                 text=True, check=False, timeout=15)
        lines = (version.stdout or version.stderr).splitlines()
        actual = lines[0].strip() if lines else "<no version output>"
        if version.returncode != 0 or not actual.startswith("pandoc "):
            return CheckResult("pandoc", False, f"{executable}: {actual}",
                               "Install Pandoc and check `pandoc --version`.")
        with resources.as_file(resources.files("hypolatex").joinpath(
            "resources", "filters", "hypolatex.lua"
        )) as lua_filter:
            probe = subprocess.run(
                [executable, "--from=markdown+fenced_divs", "--to=latex",
                 f"--lua-filter={lua_filter}"],
                input='::: {.note}\nHypoDocProbe $x^2$\n:::\n',
                capture_output=True, text=True, check=False, timeout=15,
            )
        if probe.returncode != 0 or "HypoDocProbe" not in probe.stdout:
            return CheckResult("pandoc", False,
                               f"{actual}: Lua filter probe failed. {probe.stderr.strip()}",
                               "Install a Pandoc build with Lua support; see Docs/installation.md.")
        number = actual.split()[1] if len(actual.split()) > 1 else "unknown"
        warning = "" if number in TESTED_PANDOC_VERSIONS else (
            "This version is not in our tested matrix. The filter probe passed; "
            "build and inspect a sample before relying on it."
        )
        return CheckResult("pandoc", True, f"{executable} ({actual}); Lua filter probe passed",
                           warning=warning)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return CheckResult("pandoc", False, str(exc),
                           "Check the Pandoc executable and retry; see Docs/installation.md.")


def check_pdf_evidence_tool(name: str) -> CheckResult:
    """Return whether a required Poppler evidence executable is available."""

    found = shutil.which(name)
    if found:
        return CheckResult(name=name, ok=True, detail=found)

    return CheckResult(
        name=name,
        ok=False,
        detail=f"{name} was not found on PATH.",
        remediation=(
            "Install Poppler PDF tools and ensure "
            f"`{name}` is available on PATH."
        ),
    )


def check_tex_package(name: str) -> CheckResult:
    """Return whether kpsewhich can resolve a required LaTeX package."""

    kpsewhich = shutil.which("kpsewhich")
    if not kpsewhich:
        return CheckResult(
            name=name,
            ok=False,
            detail="kpsewhich was not found, so TeX packages cannot be checked.",
            remediation=(
                "Install a TeX distribution with kpsewhich, then install "
                f"the {name} package."
            ),
        )

    target = f"{name}.sty"
    result = subprocess.run(
        [kpsewhich, target],
        capture_output=True,
        check=False,
        text=True,
    )
    output = (result.stdout or result.stderr).strip()
    if result.returncode == 0 and result.stdout.strip():
        return CheckResult(name=name, ok=True, detail=result.stdout.strip())

    detail = output or f"kpsewhich could not locate {target}."
    return CheckResult(
        name=name,
        ok=False,
        detail=detail,
        remediation=(
            f"Install the TeX package {name} in your TeX distribution; "
            f"`kpsewhich {target}` must return a .sty path."
        ),
    )


def check_font_family(family: str) -> CheckResult:
    """Return whether fontconfig resolves a requested font family exactly."""

    fc_match = shutil.which("fc-match")
    if not fc_match:
        return CheckResult(
            name=family,
            ok=False,
            detail="fc-match was not found, so font families cannot be checked.",
            remediation=(
                "Install fontconfig and the required Chinese fonts, then "
                "ensure `fc-match` is available on PATH."
            ),
        )

    result = subprocess.run(
        [fc_match, "--format=%{family}\n", family],
        capture_output=True,
        check=False,
        text=True,
    )
    output = (result.stdout or result.stderr).strip()
    if result.returncode != 0:
        detail = output or f"fc-match exited with code {result.returncode}."
        return CheckResult(
            name=family,
            ok=False,
            detail=detail,
            remediation=(
                f"Install the `{family}` font family and verify it with "
                f"`fc-match \"{family}\"`."
            ),
        )

    if _font_match_contains_family(output, family):
        return CheckResult(name=family, ok=True, detail=output or family)

    resolved = output or "<no font family returned>"
    return CheckResult(
        name=family,
        ok=False,
        detail=f"fc-match resolved to {resolved!r}, not {family!r}.",
        remediation=(
            f"Install the `{family}` font family and refresh fontconfig "
            "so `fc-match` resolves to the requested family."
        ),
    )


def _font_match_contains_family(output: str, family: str) -> bool:
    expected = family.casefold()
    candidates: list[str] = []
    for line in output.splitlines():
        candidates.extend(part.strip().casefold() for part in line.split(","))
    return expected in candidates
