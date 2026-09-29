"""Document typography and semantic behavior, checked against real TeX/PDF."""
from pathlib import Path
import re
import shutil
import subprocess

import pytest

from hypolatex import build, convert
from hypolatex.pdf_evidence import extract_text, read_pdf_info


def source(tmp_path, body, meta=""):
    path = tmp_path / "document.md"
    path.write_text("---\ntitle: 双语文档 Bilingual\nprofile: article\ntheme: course-notes\ncover: false\ntoc: false\n" + meta + "\n---\n\n" + body, encoding="utf-8")
    return path


def text(path):
    return re.sub(r"\s+", "", extract_text(path))


QA = ''':::: {.qa #quiz kind="single-choice" title="选择题"}
::: {.question title="选择正确的结论"}
Which statement is correct?
:::
::::: {.choices}
::: {.choice #a}
First option
:::
::: {.choice #b}
Second option
:::
:::::
::: {.answer choices="b" title="参考答案"}
Secret explanation
:::
::: {.solution}
Secret solution
:::
::::
'''


@pytest.mark.parametrize("mode", ["student", "review", "teacher"])
def test_canonical_choice_answers_and_visibility(tmp_path, mode):
    path = source(tmp_path, QA)
    tex = tmp_path / "result.tex"
    convert.convert_markdown(path, tex, answer_mode=mode)
    output = tmp_path / "result.pdf"
    build.build_pdf(path, output, answer_mode=mode, strict=True)
    rendered = text(output)
    assert "Firstoption" in rendered and "Secondoption" in rendered
    assert ("Secretexplanation" in rendered) == (mode != "student")
    assert ("Secretsolution" in rendered) == (mode != "student")
    if mode != "student":
        assert "参考选项：B" in rendered
    else:
        assert "Secret" not in tex.read_text()


def test_multiple_choice(tmp_path):
    path = source(tmp_path, QA.replace('single-choice', 'multiple-choice').replace('choices="b"', 'choices="a,b"'))
    output = tmp_path / "result.pdf"
    build.build_pdf(path, output, answer_mode="review", strict=True)
    assert "参考选项：A、B" in text(output)


@pytest.mark.parametrize("body", [
    QA.replace('choices="b"', 'choices="missing"'),
    QA.replace('choices="b"', 'choices="a,b"'),
    QA.replace('#b}', '#a}'),
    QA.replace('kind="single-choice"', 'kind="open"'),
    '::: {.choices}\nBad\n:::',
    '::: {.ref target="missing"}\n:::',
])
def test_invalid_assessments_and_references_preserve_output(tmp_path, body):
    path = source(tmp_path, body)
    output = tmp_path / "existing.tex"
    output.write_text("keep")
    with pytest.raises(convert.ConversionError):
        convert.convert_markdown(path, output)
    assert output.read_text() == "keep"


def test_figure_id_path_width_and_typed_reference(tmp_path, repo_root):
    assets = tmp_path / "assets"
    assets.mkdir()
    shutil.copyfile(repo_root / "Renderers/LaTeX/examples/showcase/assets/showcase-flow.png", assets / "my_image.png")
    path = source(tmp_path, '''# 图片与表格

::: {.figure #fig_demo src="my_image.png" caption="本地图像" width="70%" placement="H"}
:::

::: {.ref target="fig_demo"}
:::

::: {.table #tab_demo caption="比较表"}
| A | B |
| --- | --- |
| 1 | 2 |
:::

::: {.ref target="tab_demo"}
:::
''', "resource-root: assets")
    output = tmp_path / "result.pdf"
    result = build.build_pdf(path, output, strict=True)
    rendered = text(output)
    assert "本地图像" in rendered and "比较表" in rendered
    assert "图1" in rendered and "表1" in rendered and "??" not in rendered
    assert not result.diagnostics


def test_typography_overrides_are_present_in_pdf(tmp_path):
    path = source(tmp_path, '# 正文 Text\n\n中文字体与 Latin text。$x^2+1$\n\n::: {.note title="自定义标题"}\n内容 Content\n:::',
                  "mainfont: TeX Gyre Pagella\nmathfont: TeX Gyre Pagella Math\ncjkfont: Noto Serif CJK SC\npaper: letter\naccent: '#26536A'\nbox_density: comfortable")
    output = tmp_path / "result.pdf"
    build.build_pdf(path, output, strict=True)
    fonts = subprocess.check_output(["pdffonts", str(output)], text=True)
    assert "Pagella" in fonts and "NotoSerif" in fonts
    assert "NotoSans" not in fonts
    assert "自定义标题" in text(output) and "[自定义标题]" not in text(output)
    assert "612 x 792" in read_pdf_info(output)["page_size"]


def test_explicit_missing_font_fails(tmp_path):
    path = source(tmp_path, "正文", "mainfont: HypoDefinitelyMissingFont")
    with pytest.raises(build.BuildError, match="font not found"):
        build.build_pdf(path, tmp_path / "result.pdf")


def test_manual_numbering_switch(tmp_path):
    path = source(tmp_path, "# 1. 手写标题\n\n正文", "number_headings: false")
    output = tmp_path / "result.tex"
    convert.convert_markdown(path, output)
    assert r"\section*{1. 手写标题}" in output.read_text()


def test_inline_code_uses_mono_font(tmp_path):
    path = source(tmp_path, "# Code\n\n`index = 123`\n", "monofont: Latin Modern Mono")
    output = tmp_path / "result.pdf"
    build.build_pdf(path, output, strict=True)
    fonts = subprocess.check_output(["pdffonts", str(output)], text=True)
    assert "LMMono" in fonts


def test_long_box_breaks_without_losing_last_paragraph(tmp_path):
    paragraphs = "\n\n".join(f"段落 {i}：通过重复的长文本检查跨页内容。Long box content should remain readable. " * 3 for i in range(35))
    path = source(tmp_path, "::: {.note title=\"跨页提示\"}\n" + paragraphs + "\n\nFinalBoxMarker\n:::\n")
    output = tmp_path / "result.pdf"
    build.build_pdf(path, output, strict=True)
    assert int(read_pdf_info(output)["pages"]) > 1
    assert "FinalBoxMarker" in text(output)
