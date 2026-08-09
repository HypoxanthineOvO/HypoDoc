# Project Notes

Project: Reproducible Render Review

- Goal: reviewers can compare browser preview and PDF without losing semantic content.
- Work: define a canonical fixture, test title/divider/content ordering, and record evidence.
- Required: pinned toolchain, local-only assets, no silent placeholders.
- Deliverables: Markdown fixture, PDF, visual matrix, performance summary.
- Acceptance: page/frame membership matches; PDF text is extractable; performance gates pass.
- Review question: Why is semantic membership more stable than pixel equality?
- Hint: browser and TeX use different layout engines.
- Answer: semantic roles and order can match while typography and wrapping remain native.
- Solution: compare frame IDs/content markers first, then inspect declared visual roles.
