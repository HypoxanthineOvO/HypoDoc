from __future__ import annotations

import json
from pathlib import Path

from PIL import Image
from playwright.sync_api import Browser, sync_playwright


ROOT = Path(__file__).resolve().parents[3]
SOURCE = (ROOT / "Skills" / "LaTeX" / "templates" / "beamer.md").read_text(
    encoding="utf-8"
)
CANONICAL_SOURCE = SOURCE.replace("document_type: beamer", "profile: beamer", 1).replace(
    "::: {.table}\n", "::: {.table #tab:function-matrix-evidence}\n", 1
)
OUTPUT = ROOT / "reports" / "visual-baseline"
URL = "http://127.0.0.1:4317"


def assert_nonblank(path: Path) -> None:
    with Image.open(path) as image:
        colors = image.convert("RGB").getcolors(maxcolors=image.width * image.height)
        assert colors is None or len(colors) > 40, f"screenshot appears blank: {path}"


def capture(
    browser: Browser, source: str, width: int, height: int, name: str
) -> dict[str, object]:
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    page.goto(URL)
    page.evaluate("source => window.localStorage.setItem('hypodoc.draft', source)", source)
    page.reload()
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Read", exact=True).click()
    surface = page.locator(".hd-document, .hd-preview-blocked")
    surface.first.wait_for()
    screenshot = OUTPUT / name
    page.screenshot(path=screenshot)
    assert_nonblank(screenshot)
    result = {
        "viewport": {"width": width, "height": height},
        "surface": "blocked" if page.locator(".hd-preview-blocked").count() else "document",
        "renderedProfile": (
            page.locator(".hd-document").get_attribute("data-profile")
            if page.locator(".hd-document").count()
            else None
        ),
        "diagnostics": page.locator(".hd-preview-blocked li").all_inner_texts(),
        "frameSurfaceCount": page.locator("[data-slide-frame]").count(),
        "thematicBreakCount": page.locator(".hd-document hr").count(),
        "documentScrollHeight": page.evaluate("document.documentElement.scrollHeight"),
        "screenshot": str(screenshot.relative_to(ROOT)),
    }
    context.close()
    return result


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        report = {
            "protocol": "hypodoc.slides-gap-baseline/v1",
            "source": "Skills/LaTeX/templates/beamer.md",
            "sourceDeclares": "document_type: beamer",
            "publishedTemplate": {
                "desktop": capture(
                    browser, SOURCE, 1440, 900, "web-beamer-current-desktop.png"
                ),
                "mobile": capture(
                    browser, SOURCE, 375, 812, "web-beamer-current-mobile.png"
                ),
            },
            "minimalCanonicalRepair": {
                "changes": [
                    "document_type: beamer -> profile: beamer",
                    "add stable #tab:function-matrix-evidence to .table",
                ],
                "desktop": capture(
                    browser,
                    CANONICAL_SOURCE,
                    1440,
                    900,
                    "web-beamer-canonical-desktop.png",
                ),
                "mobile": capture(
                    browser,
                    CANONICAL_SOURCE,
                    375,
                    812,
                    "web-beamer-canonical-mobile.png",
                ),
            },
        }
        browser.close()

    output = ROOT / "reports" / "slides-gap-baseline.json"
    output.write_text(json.dumps(report, ensure_ascii=True, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=True))


if __name__ == "__main__":
    main()
