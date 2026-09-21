import re
import shutil

import pytest

from hypolatex import convert, build
from hypolatex.pdf_evidence import extract_text, read_pdf_info, render_page_png


def source(tmp_path, body, meta="profile: article\ntheme: plain"):
    path = tmp_path / "input.md"
    path.write_text(f"---\ntitle: Example\n{meta}\n---\n\n{body}\n", encoding="utf-8")
    return path


@pytest.mark.parametrize("profile,theme", [("article", "plain"), ("beamer", "minimal")])
def test_content_math_code_tables_and_image_survive_build(tmp_path, repo_root, profile, theme):
    assets = tmp_path / "assets"
    assets.mkdir()
    shutil.copyfile(repo_root / "Renderers/LaTeX/examples/showcase/assets/showcase-flow.png", assets / "flow.png")
    content = '''# 功能检查

### 内容与公式

::: {.note title="提示"}
双语内容 Bilingual content，公式 $x^2+y^2=z^2$。
:::

```python
print("hello")
```

### 表格

::: {.table #table-one kind="comparison" caption="比较表"}
| Item | Result |
| --- | --- |
| Alpha | Success |
:::

- [ ] 待办任务
- [x] 已完成

### 图片

![流程图](assets/flow.png)
'''
    if profile == "article":
        content = content.replace("###", "##")
    path = source(tmp_path, content, f"profile: {profile}\ntheme: {theme}")
    output = tmp_path / "output.pdf"
    build.build_pdf(path, output)
    text = re.sub(r"\s+", "", extract_text(output))
    for marker in ["功能检查", "Bilingualcontent", "hello", "Alpha", "Success", "流程图"]:
        assert marker in text
    png = render_page_png(output, tmp_path / "pages")
    assert png.read_bytes().startswith(b"\x89PNG")


def test_long_table_keeps_last_row(tmp_path):
    table = "| Row | Value |\n| --- | --- |\n" + "\n".join(f"| {i} | Item{i} |" for i in range(100))
    path = source(tmp_path, "::: {.table #long-table}\n```yaml\ntype: long\n```\n\n" + table + "\n:::")
    output = tmp_path / "long.pdf"
    build.build_pdf(path, output)
    assert int(read_pdf_info(output)["pages"]) > 1
    assert "Item99" in extract_text(output)


def test_same_toolchain_build_is_repeatable(tmp_path):
    path = source(tmp_path, "# 内容\n\nRepeatable content.")
    first, second = tmp_path / "one.pdf", tmp_path / "two.pdf"
    build.build_pdf(path, first)
    build.build_pdf(path, second)
    assert first.read_bytes() == second.read_bytes()


@pytest.mark.parametrize("body", [
    "::: {.unknown}\nBody\n:::",
    '::: {.figure src="../secret.png"}\n:::',
])
def test_invalid_source_does_not_replace_existing_output(tmp_path, body):
    path = source(tmp_path, body)
    output = tmp_path / "existing.pdf"
    output.write_bytes(b"keep existing output")
    with pytest.raises((convert.ConversionError, build.BuildError)):
        build.build_pdf(path, output)
    assert output.read_bytes() == b"keep existing output"


def test_missing_asset_reports_filename(tmp_path):
    path = source(tmp_path, "![Missing](assets/missing.png)")
    output = tmp_path / "output.pdf"
    with pytest.raises(build.BuildError, match="missing.png"):
        build.build_pdf(path, output)
    assert not output.exists()
