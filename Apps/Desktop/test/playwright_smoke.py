from __future__ import annotations

import os
from pathlib import Path
import shutil

from PIL import Image, ImageChops
from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASELINES = ROOT / "screenshots"
ACTUAL = ROOT / "test-results" / "visual"
URL = "http://127.0.0.1:4317"
UPDATE_SNAPSHOTS = os.environ.get("UPDATE_SNAPSHOTS") == "1"


def assert_nonblank(path: Path) -> None:
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        step_x = max(1, rgb.width // 80)
        step_y = max(1, rgb.height // 80)
        colors = {
            rgb.getpixel((x, y))
            for x in range(0, rgb.width, step_x)
            for y in range(0, rgb.height, step_y)
        }
        assert len(colors) > 40, f"screenshot appears blank: {path}"


def assert_layout(page: Page) -> None:
    metrics = page.evaluate(
        """() => ({
          viewport: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          workspace: document.querySelector('.document-workspace')?.getBoundingClientRect().toJSON(),
          topbar: document.querySelector('.topbar')?.getBoundingClientRect().toJSON(),
        })"""
    )
    assert metrics["scrollWidth"] <= metrics["viewport"], metrics
    assert metrics["workspace"]["width"] > 0 and metrics["workspace"]["height"] > 0, metrics
    assert metrics["topbar"]["height"] >= 48, metrics


def wait_for_preview(page: Page) -> None:
    page.locator(".hd-document").wait_for()
    page.locator(".katex").first.wait_for(timeout=15_000)
    page.locator(".hd-mermaid svg").wait_for(timeout=20_000)
    page.locator(".hd-code-highlight").first.wait_for(timeout=20_000)


def screenshot(page: Page, name: str) -> None:
    actual = ACTUAL / name
    baseline = BASELINES / name
    page.screenshot(path=actual)
    assert_nonblank(actual)
    if os.environ.get("SKIP_VISUAL_DIFF") == "1":
        return
    if UPDATE_SNAPSHOTS or not baseline.exists():
        shutil.copy2(actual, baseline)
        return
    with Image.open(actual).convert("RGB") as observed, Image.open(baseline).convert("RGB") as expected:
        assert observed.size == expected.size, f"visual dimensions changed for {name}"
        difference = ImageChops.difference(observed, expected)
        changed = sum(1 for pixel in difference.getdata() if max(pixel) > 24)
        ratio = changed / (observed.width * observed.height)
        assert ratio <= 0.05, f"visual regression for {name}: {ratio:.2%} pixels changed"


def desktop_flow(page: Page, console_errors: list[str]) -> None:
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    wait_for_preview(page)
    assert_layout(page)
    assert page.get_by_text("HypoDoc", exact=True).is_visible()
    assert page.get_by_role("button", name="Split").get_attribute("aria-pressed") == "true"
    assert page.get_by_text("Spec 0.2.0-rc.1", exact=True).is_visible()
    assert page.locator('[data-pane="editor"]').is_visible()
    assert page.locator('[data-pane="preview"]').is_visible()
    screenshot(page, "desktop-light-split.png")

    page.get_by_role("button", name="Read", exact=True).click()
    page.locator('[data-pane="preview"]').wait_for()
    assert page.locator('[data-pane="editor"]').count() == 0
    screenshot(page, "desktop-light-read.png")

    page.get_by_role("button", name="More document actions").click()
    page.get_by_role("menuitem", name="Settings", exact=True).click()
    settings = page.get_by_role("dialog", name="Settings")
    settings.get_by_role("button", name="Dark", exact=True).click()
    settings.get_by_role("button", name="Close settings").click()
    assert page.locator("html").get_attribute("data-theme") == "dark"
    screenshot(page, "desktop-dark-read.png")

    page.get_by_role("button", name="Edit", exact=True).click()
    editor = page.locator(".cm-content")
    editor.click()
    page.keyboard.press("Control+A")
    page.keyboard.insert_text("# Unsafe\n\n<script>alert(1)</script>\n")
    page.get_by_role("button", name="Read", exact=True).click()
    page.get_by_text("Preview paused", exact=True).wait_for()
    assert page.locator("script").filter(has_text="alert(1)").count() == 0
    assert page.get_by_text("UNSAFE_RAW_HTML", exact=True).is_visible()
    screenshot(page, "desktop-fail-closed.png")
    assert not console_errors, console_errors


def mobile_flow(page: Page, console_errors: list[str]) -> None:
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Read", exact=True).click()
    wait_for_preview(page)
    assert_layout(page)
    navigation = page.get_by_role("complementary", name="Document navigation")
    if not navigation.is_visible():
        page.get_by_role("button", name="Show sidebar").click()
    assert navigation.is_visible()
    screenshot(page, "mobile-light-navigation.png")
    page.get_by_role("button", name="Hide sidebar").click()
    assert not navigation.is_visible()
    screenshot(page, "mobile-light-read.png")
    assert not console_errors, console_errors


def main() -> None:
    BASELINES.mkdir(parents=True, exist_ok=True)
    ACTUAL.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chromium", headless=True)

        desktop_errors: list[str] = []
        desktop_context = browser.new_context(viewport={"width": 1440, "height": 900})
        desktop_page = desktop_context.new_page()
        desktop_page.on("console", lambda message: desktop_errors.append(message.text) if message.type == "error" else None)
        desktop_flow(desktop_page, desktop_errors)
        desktop_context.close()

        mobile_errors: list[str] = []
        mobile_context = browser.new_context(viewport={"width": 375, "height": 812}, device_scale_factor=1)
        mobile_page = mobile_context.new_page()
        mobile_page.on("console", lambda message: mobile_errors.append(message.text) if message.type == "error" else None)
        mobile_flow(mobile_page, mobile_errors)
        mobile_context.close()

        browser.close()

    print("playwright-smoke: desktop and mobile flows passed")


if __name__ == "__main__":
    main()
