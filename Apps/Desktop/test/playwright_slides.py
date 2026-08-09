from __future__ import annotations

from pathlib import Path

from PIL import Image
from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[3]
SOURCE = (ROOT / "research" / "fixtures" / "canonical-slides.md").read_text(
    encoding="utf-8"
)
OUTPUT = ROOT / "reports" / "visual-baseline"
URL = "http://127.0.0.1:4317"


def screenshot(page: Page, name: str) -> None:
    path = OUTPUT / name
    page.screenshot(path=path)
    with Image.open(path) as image:
        assert image.width > 0 and image.height > 0
        colors = image.convert("RGB").getcolors(maxcolors=image.width * image.height)
        assert colors is None or len(colors) > 40, f"screenshot appears blank: {path}"


def load_deck(page: Page, capture_editor: bool = False) -> None:
    page.goto(URL)
    page.evaluate("source => window.localStorage.setItem('hypodoc.draft', source)", SOURCE)
    page.reload()
    page.wait_for_load_state("networkidle")
    page.locator(".cm-editor").wait_for()
    assert page.locator(".cm-lineNumbers").count() == 0
    if capture_editor:
        screenshot(page, "m5r3-editor-default.png")
    page.get_by_role("button", name="Read", exact=True).click()
    page.get_by_role("button", name="Slides", exact=True).wait_for()
    page.locator("[data-slide-frame]").first.wait_for()


def assert_toolbar_workflows(page: Page, capture: bool = False) -> None:
    brand_mark = page.locator(".brand-mark")
    brand_mark.wait_for()
    assert brand_mark.evaluate("image => image.complete && image.naturalWidth > 0")

    open_button = page.get_by_role("button", name="Open", exact=True)
    if open_button.is_visible():
        open_button.click()
        open_menu = page.get_by_role("menu", name="Open")
        assert open_menu.get_by_role("menuitem", name="Open file", exact=True).is_visible()
        assert open_menu.get_by_role("menuitem", name="Open folder", exact=True).is_visible()
        if capture:
            screenshot(page, "m5r2-toolbar-open-menu.png")
        page.keyboard.press("Escape")
    assert page.locator('input[webkitdirectory]').count() == 1
    assert page.get_by_role("button", name="Save document").is_visible()

    page.get_by_role("button", name="More document actions").click()
    actions = page.get_by_role("menu", name="Document actions")
    assert actions.get_by_role("menuitem", name="Import Markdown", exact=True).is_visible()
    assert actions.get_by_role("menuitem", name="Export Markdown", exact=True).is_visible()
    assert actions.get_by_role("menuitem", name="Print / PDF", exact=True).is_visible()
    assert actions.get_by_role("menuitem", name="Settings", exact=True).is_visible()
    if capture:
        screenshot(page, "m5r2-toolbar-actions-menu.png")
    actions.get_by_role("menuitem", name="Settings", exact=True).click()
    settings = page.get_by_role("dialog", name="Settings")
    assert settings.get_by_role("button", name="Light", exact=True).get_attribute("aria-pressed") == "true"
    autosave = settings.get_by_role("checkbox", name="Autosave local draft")
    line_numbers = settings.get_by_role("checkbox", name="Show line numbers")
    assert autosave.is_checked()
    assert not line_numbers.is_checked()
    if capture:
        screenshot(page, "m5r2-settings.png")
    autosave.uncheck()
    page.wait_for_function("localStorage.getItem('hypodoc.autosave') === 'off'")
    autosave.check()
    line_numbers.check()
    page.wait_for_function("localStorage.getItem('hypodoc.lineNumbers') === 'on'")
    settings.get_by_role("button", name="Close settings").click()
    page.get_by_role("button", name="Edit", exact=True).click()
    page.locator(".cm-lineNumbers").wait_for()

    page.get_by_role("button", name="More document actions").click()
    page.get_by_role("menuitem", name="Settings", exact=True).click()
    settings = page.get_by_role("dialog", name="Settings")
    settings.get_by_role("checkbox", name="Show line numbers").uncheck()
    settings.get_by_role("button", name="Close settings").click()
    page.wait_for_function("localStorage.getItem('hypodoc.lineNumbers') === 'off'")
    assert page.locator(".cm-lineNumbers").count() == 0
    page.get_by_role("button", name="Read", exact=True).click()
    page.get_by_role("button", name="Slides", exact=True).click()

    page.get_by_role("button", name="More document actions").click()
    with page.expect_download() as download_info:
        page.get_by_role("menuitem", name="Export Markdown", exact=True).click()
    assert download_info.value.suggested_filename.endswith("-export.md")

    page.evaluate("window.__hypodocPrintCalled = false; window.print = () => { window.__hypodocPrintCalled = true; }")
    page.get_by_role("button", name="More document actions").click()
    page.get_by_role("menuitem", name="Print / PDF", exact=True).click()
    page.wait_for_function("window.__hypodocPrintCalled === true")

    page.get_by_role("button", name="More document actions").click()
    with page.expect_file_chooser() as chooser_info:
        page.get_by_role("menuitem", name="Import Markdown", exact=True).click()
    chooser_info.value.set_files(ROOT / "research" / "fixtures" / "canonical-slides.md")
    page.get_by_role("button", name="Slides", exact=True).click()


def assert_no_horizontal_overflow(page: Page) -> None:
    metrics = page.evaluate(
        """() => ({
          viewport: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          paneScrollWidth: document.querySelector('.preview-pane')?.scrollWidth,
          paneClientWidth: document.querySelector('.preview-pane')?.clientWidth,
        })"""
    )
    assert metrics["scrollWidth"] <= metrics["viewport"], metrics
    assert metrics["paneScrollWidth"] <= metrics["paneClientWidth"], metrics


def slide_geometry(page: Page) -> dict[str, float | str]:
    return page.locator("[data-slide-viewport]").first.evaluate(
        """viewport => {
          const frame = viewport.querySelector('[data-slide-frame]');
          const frameRect = frame.getBoundingClientRect();
          const title = frame.querySelector('.hd-slide-header button, .hd-slide-divider-content h2');
          return {
            viewportWidth: viewport.clientWidth,
            viewportScrollWidth: viewport.scrollWidth,
            frameWidth: frameRect.width,
            frameHeight: frameRect.height,
            scale: viewport.dataset.slideScale,
            logicalSize: viewport.dataset.slideLogicalSize,
            titleFontSize: title ? getComputedStyle(title).fontSize : '',
          };
        }"""
    )


def assert_fixed_slide_geometry(metrics: dict[str, float | str]) -> None:
    assert metrics["logicalSize"] == "960x540", metrics
    assert abs(float(metrics["frameWidth"]) / float(metrics["frameHeight"]) - 16 / 9) < 0.01, metrics


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        console_errors: list[str] = []
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        load_deck(page, capture_editor=True)
        assert_toolbar_workflows(page, capture=True)
        assert page.get_by_role("button", name="Slides", exact=True).get_attribute("aria-pressed") == "true"
        assert page.locator("[data-slide-frame]").count() == 9
        desktop_waterfall_geometry = slide_geometry(page)
        assert_fixed_slide_geometry(desktop_waterfall_geometry)
        assert_no_horizontal_overflow(page)
        screenshot(page, "m5r2-waterfall-desktop.png")

        page.get_by_role("button", name="Present", exact=True).click()
        page.locator(".presentation-shell").wait_for()
        controls = page.get_by_role("navigation", name="Presentation controls")
        assert page.locator(".slide-filmstrip button").count() == 9
        assert controls.get_by_text("1 / 9", exact=True).is_visible()
        page.keyboard.press("ArrowRight")
        assert controls.get_by_text("2 / 9", exact=True).is_visible()
        page.keyboard.press("End")
        assert controls.get_by_text("9 / 9", exact=True).is_visible()
        page.keyboard.press("Home")
        assert controls.get_by_text("1 / 9", exact=True).is_visible()
        page.keyboard.press("ArrowRight")
        page.keyboard.press("ArrowRight")
        page.keyboard.press("ArrowRight")
        assert controls.get_by_text("4 / 9", exact=True).is_visible()
        desktop_presentation_geometry = slide_geometry(page)
        assert_fixed_slide_geometry(desktop_presentation_geometry)
        screenshot(page, "m5r2-presentation-desktop.png")
        page.get_by_role("button", name="More document actions").click()
        page.get_by_role("menuitem", name="Settings", exact=True).click()
        settings = page.get_by_role("dialog", name="Settings")
        settings.get_by_role("button", name="Dark", exact=True).click()
        settings.get_by_role("button", name="Close settings").click()
        screenshot(page, "m5r2-presentation-desktop-dark.png")
        page.get_by_role("button", name="More document actions").click()
        page.get_by_role("menuitem", name="Settings", exact=True).click()
        settings = page.get_by_role("dialog", name="Settings")
        settings.get_by_role("button", name="Light", exact=True).click()
        settings.get_by_role("button", name="Close settings").click()

        page.get_by_role("button", name="Enter full screen").click()
        page.get_by_role("button", name="Exit full screen").wait_for()
        page.get_by_role("button", name="Exit full screen").click()
        page.get_by_role("button", name="Enter full screen").wait_for()

        page.get_by_role("button", name="Go to slide source").click()
        assert page.locator('[data-pane="editor"]').is_visible()
        context.close()

        mobile = browser.new_context(viewport={"width": 375, "height": 812})
        mobile_page = mobile.new_page()
        mobile_errors: list[str] = []
        mobile_page.on(
            "console",
            lambda message: mobile_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        load_deck(mobile_page)
        assert_toolbar_workflows(mobile_page)
        assert_no_horizontal_overflow(mobile_page)
        mobile_waterfall_geometry = slide_geometry(mobile_page)
        assert_fixed_slide_geometry(mobile_waterfall_geometry)
        assert float(mobile_waterfall_geometry["scale"]) < 0.5
        assert mobile_waterfall_geometry["viewportScrollWidth"] == mobile_waterfall_geometry["viewportWidth"]
        screenshot(mobile_page, "m5r2-waterfall-mobile.png")
        mobile_page.get_by_role("button", name="Present", exact=True).click()
        mobile_page.locator(".presentation-shell").wait_for()
        mobile_page.keyboard.press("ArrowRight")
        mobile_page.keyboard.press("ArrowRight")
        mobile_page.keyboard.press("ArrowRight")
        assert_no_horizontal_overflow(mobile_page)
        mobile_presentation_geometry = slide_geometry(mobile_page)
        assert_fixed_slide_geometry(mobile_presentation_geometry)
        assert float(mobile_presentation_geometry["scale"]) < 0.5
        assert mobile_presentation_geometry["viewportScrollWidth"] == mobile_presentation_geometry["viewportWidth"]
        assert mobile_presentation_geometry["titleFontSize"] == desktop_presentation_geometry["titleFontSize"]
        screenshot(mobile_page, "m5r2-presentation-mobile-fit.png")
        mobile_page.get_by_role("button", name="Use readable zoom").click()
        zoomed_mobile_geometry = slide_geometry(mobile_page)
        assert_fixed_slide_geometry(zoomed_mobile_geometry)
        assert float(zoomed_mobile_geometry["scale"]) >= 0.62
        assert zoomed_mobile_geometry["viewportScrollWidth"] > zoomed_mobile_geometry["viewportWidth"]
        screenshot(mobile_page, "m5r2-presentation-mobile-zoom.png")
        mobile.close()

        landscape = browser.new_context(viewport={"width": 812, "height": 375})
        landscape_page = landscape.new_page()
        landscape_errors: list[str] = []
        landscape_page.on(
            "console",
            lambda message: landscape_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        load_deck(landscape_page)
        landscape_page.get_by_role("button", name="Present", exact=True).click()
        landscape_page.keyboard.press("ArrowRight")
        landscape_page.keyboard.press("ArrowRight")
        landscape_page.keyboard.press("ArrowRight")
        landscape_geometry = slide_geometry(landscape_page)
        assert_fixed_slide_geometry(landscape_geometry)
        assert_no_horizontal_overflow(landscape_page)
        screenshot(landscape_page, "m5r2-presentation-mobile-landscape.png")
        landscape.close()
        browser.close()

    assert not console_errors, console_errors
    assert not mobile_errors, mobile_errors
    assert not landscape_errors, landscape_errors
    print("playwright-slides: waterfall and presentation flows passed")


if __name__ == "__main__":
    main()
