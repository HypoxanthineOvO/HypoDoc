#!/usr/bin/env python3
"""Prepare versioned local artifacts. Never commits, tags, pushes or publishes."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tomllib
import zipfile

ROOT = Path(__file__).resolve().parents[1]
VERSION_RE = re.compile(r"^(\d+\.\d+\.\d+)(?:-(rc)\.(\d+))?$")
PACKAGES = [ROOT / "package.json", *sorted(ROOT.glob("Packages/*/package.json")),
            ROOT / "Apps/Desktop/package.json", ROOT / "Extensions/VSCode/package.json"]
PYPROJECT = ROOT / "Renderers/LaTeX/pyproject.toml"


def run(command):
    subprocess.run(list(map(str, command)), cwd=ROOT, check=True)


def versions():
    version = json.loads((ROOT / "package.json").read_text())["version"]
    match = VERSION_RE.fullmatch(version)
    if not match:
        raise ValueError("Release version must be X.Y.Z or X.Y.Z-rc.N")
    python_version = match[1] + ("rc" + match[3] if match[2] else "")
    return version, python_version


def check():
    version, python_version = versions()
    for path in PACKAGES:
        actual = json.loads(path.read_text())["version"]
        if actual != version:
            raise ValueError(f"Version mismatch: {path.relative_to(ROOT)} = {actual}, expected {version}")
    actual = tomllib.loads(PYPROJECT.read_text())["project"]["version"]
    if actual != python_version:
        raise ValueError(f"Python version {actual} != {python_version}")
    return version, python_version


def set_version(value):
    if not VERSION_RE.fullmatch(value):
        raise ValueError("Use X.Y.Z or X.Y.Z-rc.N")
    for path in PACKAGES:
        text = path.read_text()
        path.write_text(re.sub(r'("version"\s*:\s*")[^"]+', lambda m: m[1] + value, text, count=1))
    _, python_version = versions()
    text = PYPROJECT.read_text()
    PYPROJECT.write_text(re.sub(r'(?m)^version = "[^"]+"', f'version = "{python_version}"', text, count=1))
    run(["uv", "lock", "--project", "Renderers/LaTeX"])
    check()
    print(f"Prepared {value}; inspect changes before committing.")


def source_state(allow_dirty=False):
    sha = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    dirty = bool(subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True).strip())
    if dirty and not allow_dirty:
        raise ValueError("Working tree is not clean. Commit reviewed changes first, or use --allow-dirty for LOCAL previews only.")
    return sha, dirty


def notes(version):
    text = (ROOT / "CHANGELOG.md").read_text()
    match = re.search(r"(?ms)^## " + re.escape(version) + r"\s*\n(.*?)(?=^## |\Z)", text)
    if not match:
        raise ValueError(f"CHANGELOG.md has no section for {version}")
    return match[1].strip() + "\n"


def finalize(output, allow_dirty=False):
    version, python_version = check()
    sha, dirty = source_state(allow_dirty)
    files = []
    for path in sorted(output.iterdir()):
        if path.name.startswith(".") or path.name in {"manifest.json", "CHECKSUMS.txt"} or not path.is_file():
            continue
        files.append({"name": path.name, "bytes": path.stat().st_size,
                      "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    manifest = {"version": version, "python_version": python_version, "source_commit": sha,
                "dirty": dirty, "prerelease": "-rc." in version,
                "github_run_id": os.environ.get("GITHUB_RUN_ID"), "files": files}
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    paths = [output / f["name"] for f in files] + [output / "manifest.json"]
    (output / "CHECKSUMS.txt").write_text("".join(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n" for p in paths))
    return manifest


def build(output=None, allow_dirty=False, latex_only=False):
    version, python_version = check()
    if latex_only and allow_dirty:
        raise ValueError("LaTeX source ZIP must come from a clean commit; no --allow-dirty")
    source_state(allow_dirty)
    output = Path(output).resolve() if output else ROOT / "release" / ("v" + version)
    if output.exists() and any(output.iterdir()):
        raise ValueError(f"Use an empty output directory to avoid mixing artifacts: {output}")
    output.mkdir(parents=True, exist_ok=True)
    run(["uv", "build", "--project", "Renderers/LaTeX", "--out-dir", output])
    for name in (f"hypolatex-{python_version}-py3-none-any.whl", f"hypolatex-{python_version}.tar.gz"):
        if not (output / name).is_file():
            raise ValueError(f"Missing distribution: {name}")
    kit = output / f"hypodoc-guides-skills-{version}.zip"
    with zipfile.ZipFile(kit, "w", zipfile.ZIP_DEFLATED) as archive:
        paths = [ROOT / "README.md", ROOT / "LICENSE", ROOT / "CHANGELOG.md"]
        paths += [p for p in (ROOT / "Docs").glob("*.md") if p.name not in {"architecture.md", "security.md"}]
        paths += [p for p in (ROOT / "Docs/assets").rglob("*") if p.is_file()]
        paths += [p for folder in ("Skills/Authoring", "Skills/LaTeX") for p in (ROOT / folder).rglob("*") if p.is_file()]
        for path in sorted(paths):
            archive.write(path, path.relative_to(ROOT))
    (output / "RELEASE_NOTES.md").write_text(notes(version))
    if latex_only:
        run(["git", "archive", "--format=zip", f"--prefix=HypoDoc-{version}/",
             f"--output={output / f'hypodoc-source-{version}.zip'}", "HEAD"])
        # Create immediately viewable examples with the same packaged CLI.
        for cover in ("standard", "diagonal"):
            source = output / f"School-{cover}.md"
            run(["uv", "run", "--project", "Renderers/LaTeX", "hypolatex",
                 "init", source, "--template", "slides", "--theme", "school",
                 "--school-cover", cover])
            run(["uv", "run", "--project", "Renderers/LaTeX", "hypolatex",
                 "build", source, "--strict", "--json"])
    manifest = finalize(output, allow_dirty)
    if latex_only:
        manifest["scope"] = "latex-only"
        (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        paths = [output / f["name"] for f in manifest["files"]] + [output / "manifest.json"]
        (output / "CHECKSUMS.txt").write_text("".join(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n" for p in paths))
    print(json.dumps({"output": str(output), "version": version, "dirty": manifest["dirty"]}))


def assemble(input_dir, output):
    version, python_version = check()
    sha, _ = source_state()
    source = Path(input_dir).resolve()
    output = Path(output).resolve()
    if output.exists() and any(output.iterdir()):
        raise ValueError("Assembly output must be empty")
    output.mkdir(parents=True, exist_ok=True)
    manifests = list(source.rglob("manifest.json"))
    if len(manifests) != 1:
        raise ValueError("Expected exactly one core artifact manifest from this workflow run")
    core = json.loads(manifests[0].read_text())
    if core["source_commit"] != sha or core["version"] != version or core["dirty"]:
        raise ValueError("Core artifact source/version does not match the release")
    for item in core["files"]:
        path = manifests[0].parent / item["name"]
        if path.parent != manifests[0].parent or hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
            raise ValueError("Core artifact checksum mismatch")
        shutil.copyfile(path, output / path.name)
    host_types = set()
    for path in source.rglob("*"):
        if not path.is_file() or path.suffix not in {".AppImage", ".deb", ".exe", ".dmg", ".zip", ".vsix"}:
            continue
        if path.name.startswith("hypodoc-guides-skills-"):
            continue
        if path.suffix == ".vsix":
            with zipfile.ZipFile(path) as archive:
                actual = json.loads(archive.read("extension/package.json"))["version"]
                if actual != version:
                    raise ValueError(f"VSIX version {actual} does not match {version}")
        elif not path.name.startswith(f"HypoDoc-{version}-"):
            raise ValueError(f"Unexpected host artifact: {path.name}")
        target = output / path.name
        if target.exists():
            raise ValueError(f"Duplicate artifact: {path.name}")
        shutil.copyfile(path, target)
        host_types.add(path.suffix)
    if host_types != {".AppImage", ".deb", ".exe", ".dmg", ".zip", ".vsix"}:
        raise ValueError(f"Incomplete host artifacts: {host_types}")
    finalize(output)
    print(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("check")
    version_parser = commands.add_parser("version")
    version_parser.add_argument("value", nargs="?")
    build_parser = commands.add_parser("build")
    build_parser.add_argument("--output")
    build_parser.add_argument("--allow-dirty", action="store_true")
    build_parser.add_argument("--latex-only", action="store_true",
                              help="Include a clean source ZIP and both School PDF examples; no hosts")
    assemble_parser = commands.add_parser("assemble")
    assemble_parser.add_argument("--input", required=True)
    assemble_parser.add_argument("--output", required=True)
    args = parser.parse_args()
    try:
        if args.command == "version":
            set_version(args.value) if args.value else print(versions()[0])
        elif args.command == "check":
            print(check())
        elif args.command == "build":
            build(args.output, args.allow_dirty, args.latex_only)
        else:
            assemble(args.input, args.output)
    except (ValueError, subprocess.CalledProcessError) as exc:
        parser.exit(1, str(exc) + "\n")
