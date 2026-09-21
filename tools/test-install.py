#!/usr/bin/env python3
"""Execute README quickstart in an isolated source copy, then test the wheel.

Requires uv and the PDF toolchain; downloads Python packages into temporary
environments. Does not install system tools or touch the working environment.
"""

import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parents[1]


def run(command, cwd, environment=None):
    print("+", shlex.join(map(str, command)), flush=True)
    env = os.environ.copy()
    for name in ("PYTHONPATH", "VIRTUAL_ENV", "UV_PROJECT_ENVIRONMENT"):
        env.pop(name, None)
    if environment:
        env.update(environment)
    subprocess.run(list(map(str, command)), cwd=cwd, env=env, check=True, timeout=300)


def main():
    if not shutil.which("uv"):
        raise SystemExit("Install uv before running the installation test.")
    with tempfile.TemporaryDirectory(prefix="hypodoc-install-") as temporary:
        base = Path(temporary)
        checkout = base / "HypoDoc"
        checkout.mkdir()
        home = base / "home"
        home.mkdir()
        isolated = {"HOME": str(home), "PATH": str(home / ".local/bin") + os.pathsep + os.environ["PATH"]}
        ignore = shutil.ignore_patterns(".venv", ".git", "__pycache__", ".pytest_cache", "build", "dist", "private", "private_corpus.toml")
        for path in ("Renderers/LaTeX", "Skills/LaTeX", "scripts"):
            shutil.copytree(ROOT / path, checkout / path, ignore=ignore)
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        # Execute the commands users see, not a separately maintained imitation.
        commands = [shlex.split(line) for block in re.findall(r"```sh\n(.*?)```", readme, re.S)
                    for line in block.splitlines() if line.startswith(("python3 scripts/setup.py", "hypolatex "))]
        if not commands:
            raise AssertionError("README has no executable quickstart commands")
        for command in commands:
            run(command, checkout, isolated)
        run([checkout / ".venv/bin/python", "-c",
             "import importlib.util; assert importlib.util.find_spec('pytest') is None"], checkout, isolated)
        for name in ("document", "slides"):
            pdf = checkout / f"{name}.pdf"
            assert pdf.read_bytes().startswith(b"%PDF-"), pdf
            run(["pdfinfo", pdf], checkout)
            text = subprocess.check_output(["pdftotext", str(pdf), "-"], text=True)
            marker = "我的技术文档" if name == "document" else "核心观点"
            assert marker in re.sub(r"\s+", "", text)

        run(["uv", "build", "--project", checkout / "Renderers/LaTeX", "--out-dir", base / "dist"], base)
        wheel, = (base / "dist").glob("*.whl")
        with zipfile.ZipFile(wheel) as archive:
            names = archive.namelist()
            assert any(n.endswith("hypolatex.lua") for n in names)
            assert any(n.endswith("hypolatex.sty") for n in names)
            assert not any("/private/" in n or "/tests/" in n for n in names)

        environment = base / "installed"
        run(["uv", "venv", "--python", sys.executable, environment], base)
        bin_dir = environment / ("Scripts" if os.name == "nt" else "bin")
        python = bin_dir / ("python.exe" if os.name == "nt" else "python")
        cli = bin_dir / ("hypolatex.exe" if os.name == "nt" else "hypolatex")
        run(["uv", "pip", "install", "--python", python, wheel], base)
        run([cli, "doctor", "--target", "convert", "--json"], base)
        document = base / "document.md"
        run([cli, "init", document, "--template", "article"], base)
        run([cli, "convert", document, "--output", base / "document.tex"], base)
        run([cli, "build", document, "--output", base / "installed.pdf"], base)
        assert (base / "installed.pdf").read_bytes().startswith(b"%PDF-")
        # The installed wheel must not reach back into the source tree.
        checkout.rename(base / "source-not-in-working-directory")
        for theme, cover in [("school", "standard"), ("school", "diagonal"), ("simple", None), ("nature", None)]:
            source = base / f"{theme}-{cover or 'default'}.md"
            command = [cli, "init", source, "--template", "slides", "--theme", theme]
            if cover:
                command.extend(["--school-cover", cover])
            run(command, base)
            source.write_text(source.read_text().replace("theme:", "font_preset: portable\ntheme:", 1))
            run([cli, "build", source, "--strict", "--json"], base)
            run([cli, "convert", source], base)
            assert source.with_suffix(".pdf").read_bytes().startswith(b"%PDF-")
        print("README quickstart and installed wheel passed (no Spec, Node.js or existing venv).")


if __name__ == "__main__":
    main()
