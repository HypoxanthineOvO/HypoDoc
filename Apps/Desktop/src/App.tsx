import {
  BookOpen,
  Check,
  ChevronRight,
  File,
  FileText,
  FolderOpen,
  ListTree,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Sun,
  X,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { parseHypoDoc } from "@hypodoc/parser-core";
import { countSemanticNodes, createRenderDocument } from "@hypodoc/render-model";
import { HypoDocRenderer } from "@hypodoc/render-web";

import { Editor, type EditorHandle } from "./Editor";
import { SAMPLE_DOCUMENT } from "./sample";

type ViewMode = "edit" | "split" | "read";
type SidebarTab = "files" | "outline";

const modes: Array<{ id: ViewMode; label: string }> = [
  { id: "edit", label: "Edit" },
  { id: "split", label: "Split" },
  { id: "read", label: "Read" },
];

function initialSource(): string {
  return localStorage.getItem("hypodoc.draft") ?? SAMPLE_DOCUMENT;
}

export function App() {
  const [source, setSource] = useState(initialSource);
  const deferredSource = useDeferredValue(source);
  const [fileName, setFileName] = useState("portable-workbench.md");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("split");
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("hypodoc.theme") === "dark" ? "dark" : "light",
  );
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 720);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("outline");
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const editorRef = useRef<EditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseHypoDoc(deferredSource), [deferredSource]);
  const renderDocument = useMemo(
    () => createRenderDocument(parsed, { theme, answerMode: "review" }),
    [parsed, theme],
  );
  const semanticCount = useMemo(() => countSemanticNodes(parsed.nodes), [parsed.nodes]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("hypodoc.theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => localStorage.setItem("hypodoc.draft", source), 400);
    return () => window.clearTimeout(timer);
  }, [source]);

  async function openDocument() {
    if (window.hypodocDesktop) {
      const result = await window.hypodocDesktop.openDocument();
      if (result) {
        setSource(result.content);
        setFileName(result.name);
        setFilePath(result.path);
      }
      return;
    }
    fileInputRef.current?.click();
  }

  async function saveDocument() {
    if (window.hypodocDesktop) {
      const result = await window.hypodocDesktop.saveDocument({ path: filePath, content: source });
      if (result) {
        setFileName(result.name);
        setFilePath(result.path);
      }
      return;
    }
    const blob = new Blob([source], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function goToLine(line: number) {
    setMode((current) => (current === "read" ? "split" : current));
    requestAnimationFrame(() => editorRef.current?.goToLine(line));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <button
            className="icon-button mobile-only"
            type="button"
            aria-label="Toggle navigation"
            title="Toggle navigation"
            onClick={() => setSidebarOpen((value) => !value)}
          >
            <Menu aria-hidden="true" size={18} />
          </button>
          <span className="brand-mark">H</span>
          <strong>HypoDoc</strong>
        </div>

        <div className="mode-switcher" role="group" aria-label="Document view mode">
          {modes.map((item) => (
            <button
              type="button"
              key={item.id}
              className={mode === item.id ? "active" : ""}
              aria-pressed={mode === item.id}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <button className="command-button" type="button" onClick={openDocument}>
            <FolderOpen aria-hidden="true" size={16} />
            <span>Open</span>
          </button>
          <button className="command-button" type="button" onClick={saveDocument}>
            <Save aria-hidden="true" size={16} />
            <span>Save</span>
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}
            title={`Use ${theme === "light" ? "dark" : "light"} theme`}
            onClick={() => setTheme((value) => (value === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? <Moon aria-hidden="true" size={17} /> : <Sun aria-hidden="true" size={17} />}
          </button>
        </div>
      </header>

      <div className="tabbar">
        <button
          className="sidebar-toggle icon-button"
          type="button"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          onClick={() => setSidebarOpen((value) => !value)}
        >
          {sidebarOpen ? <PanelLeftClose aria-hidden="true" size={17} /> : <PanelLeftOpen aria-hidden="true" size={17} />}
        </button>
        <div className="document-tab" aria-current="page">
          <FileText aria-hidden="true" size={15} />
          <span>{fileName}</span>
          <span className="dirty-indicator" aria-label="Autosaved locally" title="Autosaved locally" />
        </div>
      </div>

      <main id="main-workspace" className={`workspace ${sidebarOpen ? "with-sidebar" : ""}`}>
        {sidebarOpen ? (
          <>
          <button
            className="sidebar-scrim"
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="sidebar" aria-label="Document navigation">
            <div className="sidebar-tabs" role="tablist" aria-label="Sidebar view">
              <button
                type="button"
                role="tab"
                aria-selected={sidebarTab === "files"}
                onClick={() => setSidebarTab("files")}
              >
                <File aria-hidden="true" size={15} /> Files
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sidebarTab === "outline"}
                onClick={() => setSidebarTab("outline")}
              >
                <ListTree aria-hidden="true" size={15} /> Outline
              </button>
            </div>
            {sidebarTab === "files" ? (
              <div className="file-tree" role="tree">
                <div className="tree-root" role="treeitem" aria-expanded="true">
                  <ChevronRight aria-hidden="true" size={14} className="expanded" />
                  Workspace
                </div>
                <button className="tree-file active" type="button" role="treeitem">
                  <FileText aria-hidden="true" size={14} />
                  <span>{fileName}</span>
                </button>
              </div>
            ) : (
              <nav className="outline" aria-label="Document outline">
                {parsed.outline.length ? parsed.outline.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    style={{ paddingInlineStart: `${12 + (entry.depth - 1) * 14}px` }}
                    onClick={() => goToLine(entry.line)}
                  >
                    <span>{entry.text}</span>
                    <small>{entry.line}</small>
                  </button>
                )) : <p>No headings</p>}
              </nav>
            )}
          </aside>
          </>
        ) : null}

        <section className={`document-workspace mode-${mode}`} aria-label={`${mode} workspace`}>
          {mode !== "read" ? (
            <div className="editor-pane" data-pane="editor">
              <div className="pane-label">Source</div>
              <Editor ref={editorRef} value={source} theme={theme} onChange={setSource} />
            </div>
          ) : null}
          {mode !== "edit" ? (
            <div className="preview-pane" data-pane="preview">
              <div className="pane-label">Preview</div>
              <HypoDocRenderer document={renderDocument} onNavigateSource={goToLine} />
            </div>
          ) : null}
        </section>
      </main>

      {diagnosticsOpen ? (
        <section className="diagnostics-panel" aria-label="Document diagnostics">
          <header>
            <strong>Diagnostics</strong>
            <button className="icon-button" type="button" aria-label="Close diagnostics" onClick={() => setDiagnosticsOpen(false)}>
              <X aria-hidden="true" size={16} />
            </button>
          </header>
          {renderDocument.diagnostics.length ? (
            <ol>
              {renderDocument.diagnostics.map((item, index) => (
                <li key={`${item.code}-${item.range.start.offset}-${index}`}>
                  <button type="button" onClick={() => goToLine(item.range.start.line)}>
                    <span className="diagnostic-code">{item.code}</span>
                    <span>{item.message}</span>
                    <small>Ln {item.range.start.line}</small>
                  </button>
                </li>
              ))}
            </ol>
          ) : <p className="empty-diagnostics"><Check aria-hidden="true" size={16} /> No diagnostics</p>}
        </section>
      ) : null}

      <footer className="statusbar">
        <button type="button" onClick={() => setDiagnosticsOpen((value) => !value)}>
          {renderDocument.valid ? <Check aria-hidden="true" size={14} /> : <BookOpen aria-hidden="true" size={14} />}
          <span>{renderDocument.diagnostics.length} diagnostics</span>
        </button>
        <span>{parsed.profile}</span>
        <span>{semanticCount} semantic nodes</span>
        <span>HypoDoc {parsed.specVersion}</span>
      </footer>

      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file || file.size > 2 * 1024 * 1024) return;
          void file.text().then((content) => {
            setSource(content);
            setFileName(file.name);
            setFilePath(null);
          });
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
