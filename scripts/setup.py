#!/usr/bin/env python3
"""Prepare a private CLI environment; system installation requires opt-in.

No Node.js, Spec checkout, shell-profile edits or global Python changes.
"""
import argparse
import json
import os
from pathlib import Path
import platform
import shlex
import shutil
import subprocess
import sys
import tempfile
import venv

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = ["python3-venv", "pandoc", "texlive-xetex", "texlive-latex-extra", "texlive-lang-chinese",
            "latexmk", "fonts-noto-cjk", "poppler-utils"]
LAUNCHER_MARKER = "Managed by HypoDoc setup"


def system_plan(system=None):
    system = system or platform.system()
    if system == "Linux" and shutil.which("apt-get"):
        prefix = [] if hasattr(os, "geteuid") and os.geteuid() == 0 else ["sudo"]
        return [prefix + ["apt-get", "update"], prefix + ["apt-get", "install", "-y", *PACKAGES]]
    return []


def run(command):
    print("+ " + command_text(command), flush=True)
    subprocess.run(list(map(str, command)), check=True)


def command_text(command):
    arguments = list(map(str, command))
    return subprocess.list2cmdline(arguments) if os.name == "nt" else shlex.join(arguments)


def install_launcher(cli, enabled):
    if not enabled:
        return None
    if os.name == "nt":
        directory = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "HypoDoc/bin"
        target = directory / "hypolatex.cmd"
        content = f'@rem {LAUNCHER_MARKER}\n@"' + str(cli).replace("%", "%%") + '" %*\n'
    else:
        directory = Path.home() / ".local/bin"
        target = directory / "hypolatex"
        content = f"#!/bin/sh\n# {LAUNCHER_MARKER}\nexec " + shlex.quote(str(cli)) + ' "$@"\n'
    directory.mkdir(parents=True, exist_ok=True)
    if target.exists() or target.is_symlink():
        existing = target.read_text(errors="replace") if target.is_file() and not target.is_symlink() else ""
        if existing == content:
            pass
        elif any(LAUNCHER_MARKER in line for line in existing.splitlines()[:2]):
            target.write_text(content, encoding="utf-8")
            print(f"已更新 HypoDoc 用户命令：{target}")
        else:
            print(f"保留已有命令 {target}；本次 CLI 请使用完整路径 {cli}")
            return None
    else:
        with target.open("x", encoding="utf-8") as handle:
            handle.write(content)
    if os.name != "nt":
        target.chmod(0o755)
    if str(directory) not in os.environ.get("PATH", "").split(os.pathsep):
        print(f"命令目录尚未进入当前 PATH：{directory}")
        print("重开终端或使用下面列出的完整 CLI 路径；脚本不会修改 shell 配置。")
    return target


def smoke_test(cli):
    """Use this installation, not whichever old command happens to be on PATH."""
    with tempfile.TemporaryDirectory(prefix="hypodoc-school-check-") as temporary:
        for cover in ("standard", "diagonal"):
            source = Path(temporary) / f"school-{cover}.md"
            run([cli, "init", source, "--template", "slides", "--theme", "school",
                 "--school-cover", cover])
            run([cli, "build", source, "--strict", "--json"])
            if not source.with_suffix(".pdf").read_bytes().startswith(b"%PDF-"):
                raise RuntimeError("School smoke test did not produce a PDF")
    print("上科大 standard / diagonal 两种封面已实际构建通过。")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--install-system", action="store_true", help="Explicit opt-in: install the printed apt packages (may use GBs of disk)")
    parser.add_argument("--no-launcher", action="store_true", help="Do not create a user-local hypolatex command")
    parser.add_argument("--dry-run", action="store_true", help="Print the plan without changing anything")
    parser.add_argument("--installer", choices=("auto", "uv", "pip"), default="auto",
                        help="Python installer (default: uv if available, otherwise pip)")
    parser.add_argument("--smoke-test", action="store_true",
                        help="Actually build both ShanghaiTech covers after installation")
    args = parser.parse_args()
    if sys.version_info < (3, 11):
        parser.error("需要 Python 3.11+；先安装合适的 Python，再运行此脚本。")
    print(f"HypoDoc setup · {platform.system()} · Python {platform.python_version()}")
    print("本地 Python 环境：", ROOT / ".venv")
    missing = [tool for tool in ("pandoc", "xelatex", "latexmk") if not shutil.which(tool)]
    plan = system_plan()
    if missing or args.install_system:
        print("系统工具缺失：" + (", ".join(missing) if missing else "未发现；按显式请求安装/补齐"))
        for command in plan:
            print("系统安装命令：" + shlex.join(command))
        if not plan:
            print("请按 Docs/installation.md 的 macOS/Windows 指导安装 Pandoc 与 TeX。")
    if args.dry_run:
        print("预览结束：未创建环境、未安装软件、未写入 PATH。")
        return 0
    if args.install_system:
        if not plan:
            parser.error("自动系统安装目前仅支持 apt 系 Linux；其他平台请使用官方安装器。")
        print("按 --install-system 的明确授权执行；不会安装 Node.js 或配置 Spec。", flush=True)
        for command in plan:
            run(command)

    environment = ROOT / ".venv"
    marker = environment / ".hypodoc-managed"
    if environment.is_symlink() or (environment.exists() and not marker.is_file()):
        parser.error("根目录 .venv 不是本工具创建的环境；为避免覆盖，请先将它移到其他位置。")
    if not environment.exists():
        environment.mkdir()
        marker.write_text(str(ROOT) + "\n", encoding="utf-8")
    elif marker.read_text().strip() != str(ROOT):
        parser.error("此 .venv 属于另一份仓库，请使用对应仓库或新的工作目录。")
    uv = shutil.which("uv") if args.installer != "pip" else None
    if args.installer == "uv" and not uv:
        parser.error("--installer uv requires uv on PATH; use --installer pip instead.")
    try:
        venv.EnvBuilder(with_pip=uv is None).create(environment)
    except (Exception, SystemExit) as exc:
        parser.error(f"无法创建虚拟环境：{exc}。Ubuntu/Debian 可先安装 python3-venv；补齐后可安全重试。")
    binary = environment / ("Scripts" if os.name == "nt" else "bin")
    python = binary / ("python.exe" if os.name == "nt" else "python")
    cli = binary / ("hypolatex.exe" if os.name == "nt" else "hypolatex")
    project = ROOT / "Renderers/LaTeX"
    if uv:
        run([uv, "pip", "install", "--python", python, "--editable", project])
    else:
        run([python, "-m", "pip", "install", "--editable", project])
    launcher = install_launcher(cli.resolve(), not args.no_launcher)
    print(f"CLI 已安装：{cli}")
    if launcher:
        print(f"用户命令：{launcher}")
    result = subprocess.run([str(cli), "doctor", "--json"], capture_output=True, text=True)
    try:
        report = json.loads(result.stdout)
    except ValueError:
        print(result.stdout + result.stderr)
        return result.returncode or 1
    for check in report["required"]:
        print(f"[{'OK' if check['ok'] else '缺失'}] {check['name']}: {check['detail']}")
        if not check["ok"] and check.get("remediation"):
            print("  修复：" + check["remediation"])
    if report["ok"]:
        if args.smoke_test:
            smoke_test(cli)
        print("环境就绪。下一步：" + command_text([cli, "init", "slides.md", "--template", "slides", "--theme", "school"]))
        print("然后：" + command_text([cli, "build", "slides.md"]))
    else:
        print("Python CLI 已就绪，但 PDF 工具链未完整。补齐上述依赖后重新运行 setup 即可。")
        if plan:
            print("同意系统安装时可运行：python3 scripts/setup.py --install-system")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"安装命令失败（{exc.returncode}）；修正上方错误后可重试。")
