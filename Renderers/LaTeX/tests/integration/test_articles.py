"""Article is an inline-first document, not a book with chapter names removed."""
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET

import pytest
import yaml

from hypolatex import build
from hypolatex.pdf_evidence import extract_text, read_pdf_info


def make_source(tmp_path, body="# 正文\n\nBodyMarker\n", **metadata):
    meta = dict(title="短文标题 Article", subtitle="A Short Note", author="AuthorMarker",
                abstract="AbstractMarker 摘要", profile="article", theme="professional-doc")
    meta.update(metadata)
    path = tmp_path / "input.md"
    path.write_text("---\n" + yaml.safe_dump(meta, allow_unicode=True) + "---\n\n" + body, encoding="utf-8")
    return path


def pages(pdf):
    return subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"], text=True).split("\f")[:-1]


def test_article_defaults_keep_title_abstract_and_body_on_first_page(tmp_path):
    source = make_source(tmp_path, body="# 正文\n\nBodyMarker $x^2+1$\n")
    output = tmp_path / "output.pdf"
    result = build.build_pdf(source, output, strict=True)
    content = pages(output)
    assert len(content) == 1
    assert all(marker in content[0] for marker in ["短文标题", "AuthorMarker", "AbstractMarker", "BodyMarker"])
    assert content[0].count("短文标题") == 1  # No repeated first-page running title.
    assert "目录" not in content[0]
    assert not result.diagnostics
    fonts = subprocess.check_output(["pdffonts", str(output)], text=True)
    assert "Pagella-Regular" in fonts and "PagellaMath" in fonts
    assert "Termes" not in fonts


@pytest.mark.parametrize("metadata,expected_pages", [
    ({"toc": True}, 1),
    ({"title_layout": "cover"}, 2),
    ({"cover": True}, 2),
    ({"title_layout": "none"}, 1),
])
def test_article_optional_frontmatter_does_not_force_book_defaults(tmp_path, metadata, expected_pages):
    source = make_source(tmp_path, **metadata)
    output = tmp_path / "output.pdf"
    build.build_pdf(source, output, strict=True)
    content = pages(output)
    assert len(content) == expected_pages
    assert "BodyMarker" in content[-1]
    if metadata.get("toc"):
        assert "目录" in content[0]
    if metadata.get("title_layout") == "none":
        assert "AbstractMarker" not in extract_text(output)


def test_article_long_title_and_continuation_header(tmp_path):
    paragraph = "数值方法需要说明假设、计算步骤和误差来源。A technical note needs reproducible evidence. "
    body = "# 方法\n\n" + "\n\n".join(f"段落 {i}：" + paragraph * 3 for i in range(25)) + "\n\nLastParagraphMarker\n"
    source = make_source(tmp_path, body, title="一个需要自然换行而不是强行缩小字号的长标题：数值计算方法与可靠性分析", short_title="RunningTitleMarker")
    output = tmp_path / "output.pdf"
    build.build_pdf(source, output, strict=True)
    content = pages(output)
    assert len(content) > 1
    assert "RunningTitleMarker" not in content[0]
    assert "RunningTitleMarker" in content[1]
    assert "LastParagraphMarker" in content[-1]


def test_book_keeps_cover_toc_and_chapters(tmp_path):
    source = make_source(tmp_path, "# 背景\n\nFirstChapterMarker\n\n# 方法\n\nSecondChapterMarker\n", profile="book")
    output = tmp_path / "output.pdf"
    build.build_pdf(source, output, strict=True)
    content = pages(output)
    assert len(content) >= 4
    assert "短文标题" in content[0] and "FirstChapterMarker" not in content[0]
    assert "目录" in content[1]
    assert "FirstChapterMarker" in content[2]
    assert "SecondChapterMarker" in content[-1]


@pytest.mark.parametrize("example", ["article-note", "article-brief"])
def test_short_examples_fit_one_page(tmp_path, repo_root, example):
    source = repo_root / f"Renderers/LaTeX/examples/document-design/{example}.md"
    output = tmp_path / "output.pdf"
    build.build_pdf(source, output, strict=True)
    assert read_pdf_info(output)["pages"] == "1"


def test_artwork_cover_embeds_background_and_selectable_text(tmp_path, repo_root):
    image = repo_root / "Renderers/LaTeX/examples/showcase/assets/showcase-flow.png"
    shutil.copyfile(image, tmp_path / "background.png")
    source = make_source(tmp_path, "", profile="book", toc=False, cover_layout="artwork", cover_image="background.png")
    output = tmp_path / "output.pdf"
    build.build_pdf(source, output, strict=True)
    assert read_pdf_info(output)["pages"] == "1"
    assert "短文标题" in extract_text(output)
    images = subprocess.check_output(["pdfimages", "-list", str(output)], text=True)
    assert re.search(r"\n\s*1\s+0\s+image\s", images)


def test_short_code_example_stays_together_on_continuation_page(tmp_path, repo_root):
    source = repo_root / "Renderers/LaTeX/examples/document-design/article-review.md"
    output = tmp_path / "output.pdf"
    build.build_pdf(source, output, strict=True)
    content = [re.sub(r"\s+", "", page) for page in pages(output)]
    code_pages = [page for page in content if "defpublish_result" in page]
    assert len(code_pages) == 1
    assert "validate(candidate)" in code_pages[0]
    assert "candidate.replace(target)" in code_pages[0]
    assert 2 <= len(content) <= 3
    assert "本示例到此结束" in content[-1]


def test_artwork_cover_uses_cover_scale_not_body_scale(tmp_path, repo_root):
    shutil.copyfile(repo_root / "Renderers/LaTeX/examples/showcase/assets/showcase-flow.png", tmp_path / "background.png")
    source = make_source(tmp_path, "", title="TitleMarker", subtitle="SubtitleMarker", author="AuthorMarker", date="2026",
                         profile="book", toc=False, cover_layout="artwork", cover_image="background.png")
    output = tmp_path / "output.pdf"
    build.build_pdf(source, output, strict=True)
    xml = subprocess.check_output(["pdftotext", "-bbox", str(output), "-"], text=True)
    words = {node.text: float(node.attrib["yMax"]) - float(node.attrib["yMin"])
             for node in ET.fromstring(xml).iter() if node.tag.endswith("}word")}
    for marker, minimum in [("TitleMarker", 35), ("SubtitleMarker", 20), ("AuthorMarker", 18), ("2026", 16)]:
        assert words[marker] >= minimum, (marker, words)
