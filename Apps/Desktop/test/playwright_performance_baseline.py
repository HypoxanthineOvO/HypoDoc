from __future__ import annotations

import json
import os
from pathlib import Path
from statistics import median
from time import perf_counter

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[3]
URL = "http://127.0.0.1:4317"


def distribution(samples: list[float]) -> dict[str, float | int]:
    ordered = sorted(samples)
    p95_index = min(len(ordered) - 1, max(0, int(len(ordered) * 0.95)))
    return {
        "iterations": len(ordered),
        "medianMs": round(median(ordered), 3),
        "p95Ms": round(ordered[p95_index], 3),
        "maxMs": round(ordered[-1], 3),
    }


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.add_init_script("window.localStorage.clear()")
        console_errors: list[str] = []
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )

        start = perf_counter()
        page.goto(URL)
        page.wait_for_load_state("networkidle")
        page.locator(".hd-document").wait_for()
        document_ready_ms = (perf_counter() - start) * 1000

        optional_start = perf_counter()
        page.locator(".katex").first.wait_for(timeout=15_000)
        page.locator(".hd-mermaid svg").wait_for(timeout=20_000)
        page.locator(".hd-code-highlight").first.wait_for(timeout=20_000)
        optional_content_ready_ms = (perf_counter() - optional_start) * 1000

        page.get_by_role("button", name="Edit", exact=True).click()
        editor = page.locator(".cm-content")
        editor.click()
        latencies: list[float] = []
        for index in range(10):
            marker = f"render-latency-marker-{index}"
            page.keyboard.press("Control+End")
            started = perf_counter()
            page.keyboard.insert_text(f"\n\n{marker}\n")
            page.get_by_role("button", name="Read", exact=True).click()
            page.get_by_text(marker, exact=True).wait_for(timeout=10_000)
            latencies.append((perf_counter() - started) * 1000)
            page.get_by_role("button", name="Edit", exact=True).click()
            editor.click()

        report = {
            "protocol": "hypodoc.desktop-performance-baseline/v1",
            "viewport": {"width": 1440, "height": 900},
            "coldStart": {
                "documentReadyMs": round(document_ready_ms, 3),
                "optionalContentAfterDocumentMs": round(optional_content_ready_ms, 3),
            },
            "editToPreview": distribution(latencies),
            "consoleErrors": console_errors,
            "measurementNote": (
                "Includes Playwright input and mode-switch overhead; use for same-host "
                "before/after comparisons, not as a universal latency claim."
            ),
        }
        browser.close()

    output = ROOT / os.environ.get(
        "HYPODOC_DESKTOP_PERF_OUTPUT", "reports/desktop-performance-baseline.json"
    )
    output.write_text(json.dumps(report, ensure_ascii=True, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=True))


if __name__ == "__main__":
    main()
