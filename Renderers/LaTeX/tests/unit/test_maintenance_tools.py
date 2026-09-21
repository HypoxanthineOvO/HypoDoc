import importlib.util
import json
from pathlib import Path
import sys

import pytest


def module(repo_root, path):
    spec = importlib.util.spec_from_file_location("tested_helper", repo_root / path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def test_setup_dry_run_never_installs_even_with_system_flag(repo_root, tmp_path, monkeypatch):
    setup = module(repo_root, "scripts/setup.py")
    monkeypatch.setattr(setup, "ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["setup", "--dry-run", "--install-system"])
    monkeypatch.setattr(setup, "run", lambda *_: pytest.fail("dry-run executed a command"))
    assert setup.main() == 0
    assert not (tmp_path / ".venv").exists()


def test_setup_keeps_existing_unknown_environment(repo_root, tmp_path, monkeypatch):
    setup = module(repo_root, "scripts/setup.py")
    monkeypatch.setattr(setup, "ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["setup", "--no-launcher"])
    (tmp_path / ".venv").mkdir()
    owned = tmp_path / ".venv/user.txt"
    owned.write_text("keep")
    with pytest.raises(SystemExit) as exc:
        setup.main()
    assert exc.value.code == 2
    assert owned.read_text() == "keep"


def test_launcher_does_not_replace_other_installation(repo_root, tmp_path, monkeypatch):
    setup = module(repo_root, "scripts/setup.py")
    monkeypatch.setattr(Path, "home", classmethod(lambda _: tmp_path))
    target = tmp_path / ".local/bin/hypolatex"
    target.parent.mkdir(parents=True)
    target.write_text("another installation")
    assert setup.install_launcher(tmp_path / "cli", True) is None
    assert target.read_text() == "another installation"


def test_launcher_updates_previous_hypodoc_installation(repo_root, tmp_path, monkeypatch):
    setup = module(repo_root, "scripts/setup.py")
    monkeypatch.setattr(Path, "home", classmethod(lambda _: tmp_path))
    target = tmp_path / ".local/bin/hypolatex"
    target.parent.mkdir(parents=True)
    target.write_text("#!/bin/sh\n# Managed by HypoDoc setup\nexec /old/repo/.venv/bin/hypolatex \"$@\"\n")
    cli = tmp_path / "new/repo/.venv/bin/hypolatex"

    assert setup.install_launcher(cli, True) == target
    assert str(cli) in target.read_text()
    assert "/old/repo" not in target.read_text()


def test_rc_versions_are_mapped_and_checked(repo_root, tmp_path, monkeypatch):
    release = module(repo_root, "tools/release.py")
    root_package = tmp_path / "package.json"
    python_package = tmp_path / "pyproject.toml"
    root_package.write_text('{"version": "0.3.0-rc.1"}')
    python_package.write_text('[project]\nversion = "0.3.0rc1"\n')
    monkeypatch.setattr(release, "ROOT", tmp_path)
    monkeypatch.setattr(release, "PACKAGES", [root_package])
    monkeypatch.setattr(release, "PYPROJECT", python_package)
    assert release.check() == ("0.3.0-rc.1", "0.3.0rc1")
    python_package.write_text('[project]\nversion = "0.2.0"\n')
    with pytest.raises(ValueError, match="version"):
        release.check()


def test_dirty_release_is_only_an_explicit_local_preview(repo_root, monkeypatch):
    release = module(repo_root, "tools/release.py")
    monkeypatch.setattr(release.subprocess, "check_output", lambda command, **_: "abc123\n" if "rev-parse" in command else " M file\n")
    with pytest.raises(ValueError, match="not clean"):
        release.source_state()
    assert release.source_state(allow_dirty=True) == ("abc123", True)


def test_manifest_records_real_bytes_and_checksums(repo_root, tmp_path, monkeypatch):
    release = module(repo_root, "tools/release.py")
    monkeypatch.setattr(release, "check", lambda: ("0.3.0-rc.1", "0.3.0rc1"))
    monkeypatch.setattr(release, "source_state", lambda *args: ("abc123", True))
    (tmp_path / "example.whl").write_bytes(b"distribution")
    report = release.finalize(tmp_path, allow_dirty=True)
    assert report["dirty"] and report["prerelease"]
    assert report["files"][0]["bytes"] == len(b"distribution")
    assert "manifest.json" in (tmp_path / "CHECKSUMS.txt").read_text()
    assert json.loads((tmp_path / "manifest.json").read_text())["source_commit"] == "abc123"
