"""Real PDF regressions for the School adapter (requires TeX and Poppler)."""
import json
import subprocess
import xml.etree.ElementTree as ET

import pytest

from hypolatex.pdf_evidence import extract_text, read_pdf_info


@pytest.mark.parametrize("cover,ratio,chapters", [
    ("standard", "169", 8), ("standard", "43", 8),
    ("diagonal", "169", 8), ("standard", "43", 4),
])
def test_school_many_chapters_authors_and_long_metadata(runner, cli_app, tmp_path, cover, ratio, chapters):
    source = tmp_path / "stress.md"
    source.write_text(f"""---
profile: beamer
theme: school
school_cover: {cover}
aspectratio: '{ratio}'
font_preset: portable
title: 面向科研协作的文档系统与可复现排版方法
subtitle: Research Documents and Reproducible Typesetting
author:
  - 张明
  - 李华
  - 王芳
  - 陈晨
  - 刘洋
  - 赵敏
short_author: 科研排版团队
institute: 信息科学与技术学院 · 科研文档与可复现实验联合研究小组
date: 2026 年 9 月 21 日
---
""" + "\n".join(f"\n# 第{i}章：科研文档系统的设计与可复现验证\n\n### 结果 {i}\n\n独立章节的正文。\n" for i in range(1, chapters + 1)))
    result = runner.invoke(cli_app, ["build", str(source), "--strict", "--json"])
    assert result.exit_code == 0, result.output
    assert not any(d["code"] == "LAYOUT_OVERFLOW" for d in json.loads(result.stdout)["diagnostics"])
    pdf = source.with_suffix(".pdf")
    pages = extract_text(pdf).split("\f")
    assert int(read_pdf_info(pdf)["pages"]) == chapters + 1
    for name in ["张明", "李华", "王芳", "陈晨", "刘洋", "赵敏"]:
        assert name in pages[0]
    assert "科研排版团队" in pages[1]
    if chapters > 4:
        assert "1/8章节" in "".join(pages[1].split())
        assert "8/8章节" in "".join(pages[8].split())
    assert "2026" in pages[1] and "21" in pages[1]
    # All emitted words must stay on the canvas. Overlay boxes can overflow
    # without producing a TeX warning, hence this independent geometry check.
    bbox = subprocess.check_output(["pdftotext", "-bbox", str(pdf), "-"], text=True)
    root = ET.fromstring(bbox)
    ns = {"p": "http://www.w3.org/1999/xhtml"}
    cover_words = root.findall(".//p:page", ns)[0].findall(".//p:word", ns)
    subtitle = [w for w in cover_words if w.text in {"Research", "Documents", "Reproducible", "Typesetting"}]
    authors = [w for w in cover_words if w.text in {"张明", "李华", "王芳", "陈晨", "刘洋", "赵敏"}]
    assert subtitle and authors
    assert max(float(w.attrib["yMax"]) for w in subtitle) + 2 < min(float(w.attrib["yMin"]) for w in authors)
    for page in root.findall(".//p:page", ns):
        width, height = float(page.attrib["width"]), float(page.attrib["height"])
        for word in page.findall(".//p:word", ns):
            assert 0 <= float(word.attrib["xMin"]) < float(word.attrib["xMax"]) <= width
            assert 0 <= float(word.attrib["yMin"]) < float(word.attrib["yMax"]) <= height


def test_school_many_pages_in_one_chapter(runner, cli_app, tmp_path):
    source = tmp_path / "many-pages.md"
    source.write_text("---\nprofile: beamer\ntheme: school\nfont_preset: portable\ntitle: 页数压力测试\n---\n# 唯一章节\n" +
                      "\n".join(f"\n### 页面 {i}\n\n正文。\n" for i in range(1, 15)))
    result = runner.invoke(cli_app, ["build", str(source), "--strict", "--json"])
    assert result.exit_code == 0, result.output
    text = extract_text(source.with_suffix(".pdf"))
    assert "14 页" in text
    assert int(read_pdf_info(source.with_suffix(".pdf"))["pages"]) == 15
