"""Real public CLI → PDF checks. Missing toolchains fail, not silently skip."""

import re
import shutil
import pytest

from hypolatex.pdf_evidence import extract_text, read_pdf_info


def build(runner, cli_app, source, output, *options):
    result = runner.invoke(cli_app, ["build", str(source), "--output", str(output), *options])
    assert result.exit_code == 0, result.output
    assert output.read_bytes().startswith(b"%PDF-")
    return re.sub(r"\s+", "", extract_text(output))


@pytest.mark.parametrize("name,marker", [
    ("longform", "我的技术文档"), ("project", "项目说明"),
    ("review", "求函数"), ("cheatsheet", "技术速查表"), ("beamer", "核心观点"),
])
def test_every_public_template_builds_after_copying_outside_repo(runner, cli_app, templates, tmp_path, name, marker):
    source = tmp_path / f"{name}.md"
    shutil.copyfile(templates / f"{name}.md", source)
    output = tmp_path / "output.pdf"
    text = build(runner, cli_app, source, output)
    assert marker in text
    info = read_pdf_info(output)
    width, height = map(float, re.search(r"([\d.]+) x ([\d.]+)", info["page_size"]).groups())
    if name == "beamer":
        assert int(info["pages"]) == 4
        assert width / height == pytest.approx(16 / 9, abs=0.01)
        assert text.index("核心观点") < text.index("方法与证据") < text.rindex("总结")
    else:
        assert width == pytest.approx(595, abs=2)
        assert height == pytest.approx(842, abs=2)


def test_review_answer_visibility(runner, cli_app, templates, tmp_path):
    source = templates / "review.md"
    student = build(runner, cli_app, source, tmp_path / "student.pdf")
    reviewer = build(runner, cli_app, source, tmp_path / "reviewer.pdf", "--answer-mode", "review")
    assert "求函数" in student and "求函数" in reviewer
    assert "参考答案" not in student and "幂函数满足" not in student
    assert "参考答案" in reviewer and "幂函数满足" in reviewer


@pytest.mark.parametrize("profile,theme", [
    ("article", "plain"), ("article", "classic-readable"), ("article", "tech-minimal"),
    ("article", "warm-handbook"), ("article", "academic-clean"),
    ("beamer", "plain"), ("beamer", "minimal"), ("beamer", "shanghaitech"), ("beamer", "glass"),
    ("beamer", "school"), ("beamer", "simple"), ("beamer", "nature"),
])
def test_theme_can_render_real_content(runner, cli_app, tmp_path, profile, theme):
    source = tmp_path / "source.md"
    body = "# 主题\n\n### 内容\n" if profile == "beamer" else "# 内容\n"
    source.write_text(f"---\ntitle: Sample\nprofile: {profile}\ntheme: {theme}\n---\n\n{body}\n中文与 English。$E=mc^2$\n", encoding="utf-8")
    assert "中文与English" in build(runner, cli_app, source, tmp_path / "sample.pdf")
