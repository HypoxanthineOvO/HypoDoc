#!/usr/bin/env python3
"""Compare installed production themes. No private renderer or theme checkout."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / "build/experiments/theme-comparison"


def run(command):
    result = subprocess.run(list(map(str, command)), cwd=OUT, capture_output=True, text=True, timeout=180)
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)
    return result.stdout


def find_cli():
    executable = "Scripts/hypolatex.exe" if os.name == "nt" else "bin/hypolatex"
    for env in (ROOT / ".venv", ROOT / "Renderers/LaTeX/.venv"):
        path = env / executable
        if path.exists():
            return str(path)
    path = shutil.which("hypolatex")
    if path:
        return path
    raise SystemExit("先运行 python3 scripts/setup.py 安装正式 CLI。")


def proof(names, output, pages):
    width = 50 if len(names) == 3 else 33
    parts = [r"\documentclass{article}",
             rf"\usepackage[paperwidth={width}cm,paperheight=11.2cm,margin=3mm]{{geometry}}",
             r"\usepackage{graphicx,fontspec}\setmainfont{TeX Gyre Termes}",
             r"\pagestyle{empty}\setlength{\parindent}{0pt}\begin{document}"]
    for page in range(1, pages + 1):
        for index, (title, name) in enumerate(names):
            if index:
                parts.append(r"\hfill")
            parts.extend([rf"\begin{{minipage}}[t]{{{0.975/len(names):.3f}\textwidth}}\centering",
                          rf"{{\large\bfseries {title} / {page:02}}}\\[2mm]",
                          rf"\includegraphics[page={page},width=\linewidth]{{{name}.pdf}}",
                          r"\end{minipage}%"])
        if page != pages:
            parts.append(r"\newpage")
    parts.append(r"\end{document}")
    target = OUT / (output + ".tex")
    target.write_text("\n".join(parts))
    run(["latexmk", "-xelatex", "-interaction=nonstopmode", "-halt-on-error", target.name])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--school-cover", choices=("standard", "diagonal"), default="standard")
    parser.add_argument("--all-school-covers", action="store_true")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "assets").mkdir(exist_ok=True)
    shutil.copyfile(HERE / "Experiment.md", OUT / "Experiment.md")
    run(["latexmk", "-xelatex", "-interaction=nonstopmode", "-halt-on-error", "-outdir=" + str(OUT / "assets"), HERE / "assets/pipeline.tex"])
    cli = find_cli()
    variants = [("school", args.school_cover), ("simple", None), ("nature", None)]
    if args.all_school_covers:
        variants.append(("school", "diagonal" if args.school_cover == "standard" else "standard"))
    reports = []
    bodies = set()
    for theme, cover in variants:
        name = "Experiment-" + theme + ("-" + cover if cover else "")
        options = ["--theme", theme] + (["--school-cover", cover] if cover else [])
        run([cli, "convert", "Experiment.md", "--output", name + ".tex", *options])
        report = json.loads(run([cli, "build", "Experiment.md", "--output", name + ".pdf", "--strict", "--json", *options]))
        text = (OUT / (name + ".tex")).read_text()
        body = text.split("% BEGIN SHARED CONTENT")[1].split("% END SHARED CONTENT")[0]
        bodies.add(hashlib.sha256(body.encode()).hexdigest())
        report.update(theme=theme, school_cover=cover, tex=name + ".tex")
        reports.append(report)
        previews = OUT / "previews" / (theme + ("-" + cover if cover else ""))
        previews.mkdir(parents=True, exist_ok=True)
        run(["pdftoppm", "-scale-to", "1400", "-png", name + ".pdf", previews / "page"])
    assert len(bodies) == 1, "主题正文必须相同"
    for suffix in (".tex", ".pdf"):
        shutil.copyfile(OUT / ("Experiment-school-" + args.school_cover + suffix), OUT / ("Experiment-school" + suffix))
    shutil.copyfile(OUT / "Experiment-school.tex", OUT / "Experiment.tex")
    proof([(t.title(), "Experiment-" + t) for t in ("school", "simple", "nature")], "Experiment-comparison", 10)
    if args.all_school_covers:
        proof([(c.title(), "Experiment-school-" + c) for c in ("standard", "diagonal")], "School-cover-comparison", 1)
    (OUT / "comparison-checks.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2))
    print(OUT)


if __name__ == "__main__":
    main()
