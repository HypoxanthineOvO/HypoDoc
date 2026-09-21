"""Validate user navigation, not prescribed wording or document structure."""

from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


def test_user_guides_link_to_existing_local_files(repo_root):
    paths = [repo_root / "README.md", repo_root / "Renderers/LaTeX/README.md"]
    paths += list((repo_root / "Docs").glob("*.md"))
    paths = [p for p in paths if p.name not in {"architecture.md", "security.md"}]
    paths += list((repo_root / "Skills/LaTeX").glob("*.md"))
    paths += list((repo_root / "Renderers/LaTeX/docs").glob("*.md"))
    missing = []
    for path in paths:
        text = re.sub(r"(?ms)^(`{3,}|~{3,})[^\n]*\n.*?^\1\s*$", "", path.read_text(encoding="utf-8"))
        text = re.sub(r"(`+).*?\1", "", text)
        for target in re.findall(r"\[[^\]]*\]\(([^)\n]+)\)", text):
            target = target.strip().strip("<>")
            url = urlsplit(target)
            if url.scheme or not url.path:
                continue
            destination = (path.parent / unquote(url.path)).resolve()
            if not destination.exists():
                missing.append(f"{path.relative_to(repo_root)} -> {target}")
    assert not missing, "Broken guide links:\n" + "\n".join(missing)
