# Security Boundary

Hypo Markdown treats every document as untrusted local input. A document may
control text and registered semantic attributes; it does not gain script,
network, process, or arbitrary filesystem capabilities.

## Shared Renderer

- Raw HTML is disabled in the Markdown renderer. Active HTML also produces a
  fail-closed parser diagnostic.
- KaTeX receives math AST nodes only after Markdown sanitization.
- Mermaid is lazy loaded with `securityLevel: strict`; generated SVG is passed
  through DOMPurify's SVG profile before insertion.
- Shiki is lazy loaded with a fixed language/theme allowlist; generated markup
  is passed through DOMPurify before insertion. Unknown languages remain escaped
  plain code.
- Figure and Markdown image paths must be relative, scheme-free, and free of
  traversal segments. Remote and absolute resources are rejected.
- Documents larger than 2 MB or 10,000 parsed blocks fail closed.

## Electron

- `nodeIntegration: false`, `contextIsolation: true`, renderer sandboxing, and
  `webSecurity: true` are mandatory and covered by tests.
- CSP denies remote scripts, objects, frames, forms, and navigation.
- The frozen preload surface exposes only `openDocument` and `saveDocument`.
- Main process dialogs authorize file paths. Silent writes are accepted only
  for paths previously selected through a native open/save dialog.
- Open/save payloads are limited to `.md`/`.markdown` and 2 MB.
- New windows are denied. HTTPS external navigation can only leave through the
  main process handler; preview links themselves do not navigate the renderer.

## VS Code

- The Webview uses a nonce CSP with `default-src 'none'` and
  `connect-src 'none'`.
- `localResourceRoots` contains only extension build assets and the active
  document directory.
- The extension converts only validated workspace-relative figure paths with
  `asWebviewUri`.
- Webview messages are shape checked. Source navigation accepts only an integer
  line and clamps it to the active document.

## Verification

`pnpm test` covers the parser surface, negative fixtures, rendering sanitation,
workspace resource policy, Electron flags and IPC authorization, and VS Code
Webview restrictions. `apps/desktop/test/playwright_smoke.py` exercises light,
dark, desktop, mobile, and fail-closed states in Chromium while rejecting
console errors and horizontal viewport overflow.
