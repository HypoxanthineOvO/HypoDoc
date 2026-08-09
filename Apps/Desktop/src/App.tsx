import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  File,
  FileInput,
  FileOutput,
  FileText,
  FilePenLine,
  FolderOpen,
  LayoutList,
  ListTree,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Save,
  Scan,
  Settings,
  Presentation,
  X,
  ZoomIn,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { parseHypoDoc } from "@hypodoc/parser-core";
import { countSemanticNodes, createRenderDocument, createSlideDeck } from "@hypodoc/render-model";
import { HypoDocRenderer, HypoDocSlideDeckRenderer } from "@hypodoc/render-web";

import { Editor, type EditorHandle } from "./Editor";
import { SAMPLE_DOCUMENT } from "./sample";

type ViewMode = "edit" | "split" | "read";
type SidebarTab = "files" | "outline";
type SlideView = "document" | "waterfall" | "presentation";
type ToolbarMenu = "open" | "more" | null;
type FilePickerIntent = "open" | "import";

interface WorkspaceEntry {
  path: string;
  name: string;
  relativePath: string;
  file?: File;
}

interface WorkspaceState {
  path: string | null;
  name: string;
  documents: WorkspaceEntry[];
}

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
  const [autosaveEnabled, setAutosaveEnabled] = useState(() => localStorage.getItem("hypodoc.autosave") !== "off");
  const [showLineNumbers, setShowLineNumbers] = useState(() => localStorage.getItem("hypodoc.lineNumbers") === "on");
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 720);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("outline");
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [activeWorkspacePath, setActiveWorkspacePath] = useState<string | null>(null);
  const [toolbarMenu, setToolbarMenu] = useState<ToolbarMenu>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [slideView, setSlideView] = useState<SlideView>("waterfall");
  const [activeFrame, setActiveFrame] = useState(0);
  const [presentationFullscreen, setPresentationFullscreen] = useState(false);
  const [presentationScaleMode, setPresentationScaleMode] = useState<"fit" | "readable">("fit");
  const editorRef = useRef<EditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filePickerIntentRef = useRef<FilePickerIntent>("open");
  const topbarRef = useRef<HTMLElement>(null);
  const presentationRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseHypoDoc(deferredSource), [deferredSource]);
  const renderDocument = useMemo(
    () => createRenderDocument(parsed, { theme, answerMode: "review" }),
    [parsed, theme],
  );
  const semanticCount = useMemo(() => countSemanticNodes(parsed.nodes), [parsed.nodes]);
  const slideDeck = useMemo(
    () => renderDocument.profile === "beamer" ? createSlideDeck(renderDocument) : null,
    [renderDocument],
  );
  const slideDiagnostics = slideDeck && !slideDeck.valid ? slideDeck.diagnostics : renderDocument.diagnostics;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("hypodoc.theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("hypodoc.autosave", autosaveEnabled ? "on" : "off");
    if (!autosaveEnabled) return;
    const timer = window.setTimeout(() => localStorage.setItem("hypodoc.draft", source), 400);
    return () => window.clearTimeout(timer);
  }, [autosaveEnabled, source]);

  useEffect(() => {
    localStorage.setItem("hypodoc.lineNumbers", showLineNumbers ? "on" : "off");
  }, [showLineNumbers]);

  useEffect(() => {
    const closeMenus = (event: PointerEvent) => {
      if (!topbarRef.current?.contains(event.target as Node)) setToolbarMenu(null);
    };
    const closeTransientUi = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setToolbarMenu(null);
      setSettingsOpen(false);
    };
    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeTransientUi);
    return () => {
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("keydown", closeTransientUi);
    };
  }, []);

  useEffect(() => {
    setActiveFrame((current) => Math.min(current, Math.max(0, (slideDeck?.frames.length ?? 1) - 1)));
  }, [slideDeck?.frames.length]);

  useEffect(() => {
    const onFullscreenChange = () => setPresentationFullscreen(document.fullscreenElement === presentationRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (slideView !== "presentation" || !slideDeck?.valid) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        setActiveFrame((current) => Math.min(slideDeck.frames.length - 1, current + 1));
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        setActiveFrame((current) => Math.max(0, current - 1));
      } else if (event.key === "Home") {
        event.preventDefault();
        setActiveFrame(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setActiveFrame(Math.max(0, slideDeck.frames.length - 1));
      } else if (event.key === "Escape" && !document.fullscreenElement) {
        setSlideView("waterfall");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [slideDeck, slideView]);

  function applyDocument(document: { content: string; name: string; path?: string | null }, preserveWorkspace = false) {
    setSource(document.content);
    setFileName(document.name);
    setFilePath(document.path ?? null);
    if (!preserveWorkspace) {
      setWorkspace(null);
      setActiveWorkspacePath(null);
    }
    setCommandError(null);
  }

  function reportCommandError(error: unknown) {
    setCommandError(error instanceof Error ? error.message : "The command could not be completed.");
  }

  function triggerFilePicker(intent: FilePickerIntent) {
    filePickerIntentRef.current = intent;
    fileInputRef.current?.click();
  }

  async function openDocument() {
    setToolbarMenu(null);
    try {
      if (window.hypodocDesktop) {
        const result = await window.hypodocDesktop.openDocument();
        if (result) applyDocument(result);
        return;
      }
      triggerFilePicker("open");
    } catch (error) {
      reportCommandError(error);
    }
  }

  async function importDocument() {
    setToolbarMenu(null);
    try {
      if (window.hypodocDesktop) {
        const result = await window.hypodocDesktop.openDocument();
        if (result) {
          applyDocument({ content: result.content, name: result.name, path: null }, true);
          setActiveWorkspacePath(null);
        }
        return;
      }
      triggerFilePicker("import");
    } catch (error) {
      reportCommandError(error);
    }
  }

  async function openWorkspaceDocument(entry: WorkspaceEntry, nextWorkspace = workspace) {
    try {
      if (entry.file) {
        if (entry.file.size > 2 * 1024 * 1024) throw new Error("Document exceeds the 2 MB safety limit.");
        applyDocument({ content: await entry.file.text(), name: entry.name }, true);
      } else if (window.hypodocDesktop) {
        const result = await window.hypodocDesktop.readWorkspaceDocument(entry.path);
        applyDocument(result, true);
      }
      setActiveWorkspacePath(entry.path);
      if (nextWorkspace) setWorkspace(nextWorkspace);
    } catch (error) {
      reportCommandError(error);
    }
  }

  async function openWorkspace() {
    setToolbarMenu(null);
    try {
      if (window.hypodocDesktop) {
        const result = await window.hypodocDesktop.openWorkspace();
        if (!result) return;
        const nextWorkspace: WorkspaceState = result;
        setWorkspace(nextWorkspace);
        setSidebarTab("files");
        setSidebarOpen(true);
        if (nextWorkspace.documents[0]) await openWorkspaceDocument(nextWorkspace.documents[0], nextWorkspace);
        return;
      }
      folderInputRef.current?.click();
    } catch (error) {
      reportCommandError(error);
    }
  }

  async function saveDocument() {
    try {
      if (window.hypodocDesktop) {
        const result = await window.hypodocDesktop.saveDocument({ path: filePath, content: source });
        if (result) {
          setFileName(result.name);
          setFilePath(result.path);
        }
        return;
      }
      downloadMarkdown(fileName);
    } catch (error) {
      reportCommandError(error);
    }
  }

  function downloadMarkdown(downloadName: string) {
    const blob = new Blob([source], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function exportMarkdown() {
    setToolbarMenu(null);
    try {
      if (window.hypodocDesktop) {
        await window.hypodocDesktop.saveDocument({ path: null, content: source });
      } else {
        const stem = fileName.replace(/\.(md|markdown)$/i, "") || "document";
        downloadMarkdown(`${stem}-export.md`);
      }
    } catch (error) {
      reportCommandError(error);
    }
  }

  function exportPrintPdf() {
    setToolbarMenu(null);
    setMode("read");
    if (slideDeck?.valid) setSlideView("document");
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  function goToLine(line: number) {
    setMode((current) => (current === "read" ? "split" : current));
    requestAnimationFrame(() => editorRef.current?.goToLine(line));
  }

  function selectSlideView(next: SlideView) {
    setSlideView(next);
    if (next === "presentation") {
      setMode("read");
      setSidebarOpen(false);
    }
  }

  async function togglePresentationFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await presentationRef.current?.requestFullscreen();
    }
  }

  return (
    <div className="app-shell">
      <header ref={topbarRef} className="topbar">
        <div className="toolbar-leading">
          <button
            className="sidebar-toggle icon-button"
            type="button"
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            onClick={() => setSidebarOpen((value) => !value)}
          >
            {sidebarOpen ? <PanelLeftClose aria-hidden="true" size={17} /> : <PanelLeftOpen aria-hidden="true" size={17} />}
          </button>
          <div className="brand-lockup" aria-label="HypoDoc">
            <img className="brand-mark" src="/brand/hypodoc-mark.png" alt="" width="24" height="24" />
            <span className="brand-wordmark">HypoDoc</span>
          </div>
          <div className="document-identity" aria-label={`Current document ${fileName}`}>
            <FileText aria-hidden="true" size={14} />
            <span>{fileName}</span>
            <span className="dirty-indicator" aria-label="Autosaved locally" title="Autosaved locally" />
          </div>
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
          <div className="menu-anchor">
            <button
              className="command-button open-command"
              type="button"
              aria-haspopup="menu"
              aria-expanded={toolbarMenu === "open"}
              onClick={() => setToolbarMenu((current) => current === "open" ? null : "open")}
            >
              <FolderOpen aria-hidden="true" size={16} />
              <span>Open</span>
              <ChevronDown aria-hidden="true" size={13} />
            </button>
            {toolbarMenu === "open" ? (
              <div className="toolbar-menu open-menu" role="menu" aria-label="Open">
                <button type="button" role="menuitem" onClick={() => void openDocument()}>
                  <FileText aria-hidden="true" size={16} />
                  <span>Open file</span>
                </button>
                <button type="button" role="menuitem" onClick={() => void openWorkspace()}>
                  <FolderOpen aria-hidden="true" size={16} />
                  <span>Open folder</span>
                </button>
              </div>
            ) : null}
          </div>
          <button className="icon-button" type="button" aria-label="Save document" title="Save document" onClick={() => void saveDocument()}>
            <Save aria-hidden="true" size={16} />
          </button>
          <div className="menu-anchor">
            <button
              className="icon-button"
              type="button"
              aria-label="More document actions"
              title="More document actions"
              aria-haspopup="menu"
              aria-expanded={toolbarMenu === "more"}
              onClick={() => setToolbarMenu((current) => current === "more" ? null : "more")}
            >
              <Ellipsis aria-hidden="true" size={18} />
            </button>
            {toolbarMenu === "more" ? (
              <div className="toolbar-menu more-menu" role="menu" aria-label="Document actions">
                <button type="button" role="menuitem" onClick={() => void importDocument()}>
                  <FileInput aria-hidden="true" size={16} />
                  <span>Import Markdown</span>
                </button>
                <button type="button" role="menuitem" onClick={() => void exportMarkdown()}>
                  <FileOutput aria-hidden="true" size={16} />
                  <span>Export Markdown</span>
                </button>
                <button type="button" role="menuitem" onClick={exportPrintPdf}>
                  <Printer aria-hidden="true" size={16} />
                  <span>Print / PDF</span>
                </button>
                <div className="menu-separator" role="separator" />
                <button type="button" role="menuitem" onClick={() => { setToolbarMenu(null); setSettingsOpen(true); }}>
                  <Settings aria-hidden="true" size={16} />
                  <span>Settings</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

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
                  {workspace?.name ?? "Workspace"}
                </div>
                {workspace?.documents.length ? workspace.documents.map((entry) => (
                  <button
                    className={`tree-file ${entry.path === activeWorkspacePath ? "active" : ""}`}
                    type="button"
                    role="treeitem"
                    key={entry.path}
                    title={entry.relativePath}
                    onClick={() => void openWorkspaceDocument(entry)}
                  >
                    <FileText aria-hidden="true" size={14} />
                    <span>{entry.relativePath}</span>
                  </button>
                )) : (
                  <button className="tree-file active" type="button" role="treeitem">
                    <FileText aria-hidden="true" size={14} />
                    <span>{fileName}</span>
                  </button>
                )}
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
              <Editor
                ref={editorRef}
                value={source}
                theme={theme}
                showLineNumbers={showLineNumbers}
                onChange={setSource}
              />
            </div>
          ) : null}
          {mode !== "edit" ? (
            <div className="preview-pane" data-pane="preview">
              {!slideDeck?.valid ? <div className="pane-label">Preview</div> : null}
              {slideDeck?.valid ? (
                <div className="slide-preview">
                  <div className="slide-view-switcher" role="group" aria-label="Beamer preview mode">
                    <button
                      type="button"
                      className={slideView === "document" ? "active" : ""}
                      aria-pressed={slideView === "document"}
                      onClick={() => selectSlideView("document")}
                    >
                      <FileText aria-hidden="true" size={15} /> Document
                    </button>
                    <button
                      type="button"
                      className={slideView === "waterfall" ? "active" : ""}
                      aria-pressed={slideView === "waterfall"}
                      onClick={() => selectSlideView("waterfall")}
                    >
                      <LayoutList aria-hidden="true" size={15} /> Slides
                    </button>
                    <button
                      type="button"
                      className={slideView === "presentation" ? "active" : ""}
                      aria-pressed={slideView === "presentation"}
                      onClick={() => selectSlideView("presentation")}
                    >
                      <Presentation aria-hidden="true" size={15} /> Present
                    </button>
                  </div>
                  {slideView === "document" ? (
                    <HypoDocRenderer document={renderDocument} onNavigateSource={goToLine} />
                  ) : slideView === "waterfall" ? (
                    <HypoDocSlideDeckRenderer
                      deck={slideDeck}
                      mode="waterfall"
                      onNavigateSource={goToLine}
                    />
                  ) : (
                    <div ref={presentationRef} className="presentation-shell">
                      <aside className="slide-filmstrip" aria-label="Slide navigation">
                        {slideDeck.frames.map((frame, index) => (
                          <button
                            type="button"
                            key={frame.id}
                            className={activeFrame === index ? "active" : ""}
                            aria-current={activeFrame === index ? "page" : undefined}
                            onClick={() => setActiveFrame(index)}
                          >
                            <span>{index + 1}</span>
                            <strong>{frame.title}</strong>
                          </button>
                        ))}
                      </aside>
                      <div className="presentation-stage">
                        <HypoDocSlideDeckRenderer
                          deck={slideDeck}
                          mode="presentation"
                          activeFrame={activeFrame}
                          scaleMode={presentationScaleMode}
                          onNavigateSource={goToLine}
                        />
                      </div>
                      <nav className="presentation-controls" aria-label="Presentation controls">
                        <button
                          type="button"
                          aria-label="Previous slide"
                          title="Previous slide"
                          disabled={activeFrame === 0}
                          onClick={() => setActiveFrame((current) => Math.max(0, current - 1))}
                        >
                          <ChevronRight aria-hidden="true" size={18} className="previous-icon" />
                        </button>
                        <span>{activeFrame + 1} / {slideDeck.frames.length}</span>
                        <button
                          type="button"
                          aria-label="Next slide"
                          title="Next slide"
                          disabled={activeFrame >= slideDeck.frames.length - 1}
                          onClick={() => setActiveFrame((current) => Math.min(slideDeck.frames.length - 1, current + 1))}
                        >
                          <ChevronRight aria-hidden="true" size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label={presentationScaleMode === "fit" ? "Use readable zoom" : "Fit slide"}
                          title={presentationScaleMode === "fit" ? "Use readable zoom" : "Fit slide"}
                          aria-pressed={presentationScaleMode === "readable"}
                          onClick={() => setPresentationScaleMode((current) => current === "fit" ? "readable" : "fit")}
                        >
                          {presentationScaleMode === "fit" ? <ZoomIn aria-hidden="true" size={17} /> : <Scan aria-hidden="true" size={17} />}
                        </button>
                        <button
                          type="button"
                          aria-label="Go to slide source"
                          title="Go to slide source"
                          onClick={() => goToLine(slideDeck.frames[activeFrame]?.position.start.line ?? 1)}
                        >
                          <FilePenLine aria-hidden="true" size={17} />
                        </button>
                        <button
                          type="button"
                          aria-label={presentationFullscreen ? "Exit full screen" : "Enter full screen"}
                          title={presentationFullscreen ? "Exit full screen" : "Enter full screen"}
                          onClick={() => void togglePresentationFullscreen()}
                        >
                          {presentationFullscreen ? <X aria-hidden="true" size={18} /> : <Maximize2 aria-hidden="true" size={17} />}
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {slideDeck ? (
                    <div className="slide-fallback-notice" role="status">
                      Slides unavailable. Showing document view.
                    </div>
                  ) : null}
                  <HypoDocRenderer document={renderDocument} onNavigateSource={goToLine} />
                </>
              )}
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
          {slideDiagnostics.length ? (
            <ol>
              {slideDiagnostics.map((item, index) => (
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

      {settingsOpen ? (
        <div className="dialog-backdrop" onPointerDown={(event) => { if (event.currentTarget === event.target) setSettingsOpen(false); }}>
          <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <header>
              <h2 id="settings-title">Settings</h2>
              <button className="icon-button" type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}>
                <X aria-hidden="true" size={16} />
              </button>
            </header>
            <div className="settings-row">
              <span>Appearance</span>
              <div className="settings-options" role="group" aria-label="Appearance">
                <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
                <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
              </div>
            </div>
            <label className="settings-row settings-toggle">
              <span>Autosave local draft</span>
              <input type="checkbox" checked={autosaveEnabled} onChange={(event) => setAutosaveEnabled(event.target.checked)} />
            </label>
            <label className="settings-row settings-toggle">
              <span>Show line numbers</span>
              <input type="checkbox" checked={showLineNumbers} onChange={(event) => setShowLineNumbers(event.target.checked)} />
            </label>
          </section>
        </div>
      ) : null}

      {commandError ? (
        <div className="command-error" role="alert">
          <span>{commandError}</span>
          <button className="icon-button" type="button" aria-label="Dismiss error" onClick={() => setCommandError(null)}>
            <X aria-hidden="true" size={15} />
          </button>
        </div>
      ) : null}

      <footer className="statusbar">
        <button type="button" onClick={() => setDiagnosticsOpen((value) => !value)}>
          {renderDocument.valid && (!slideDeck || slideDeck.valid) ? <Check aria-hidden="true" size={14} /> : <BookOpen aria-hidden="true" size={14} />}
          <span>{slideDiagnostics.length} diagnostics</span>
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
            applyDocument({ content, name: file.name, path: null }, filePickerIntentRef.current === "import");
            if (filePickerIntentRef.current === "import") setActiveWorkspacePath(null);
          });
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        className="visually-hidden"
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        multiple
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        onChange={(event) => {
          const documents = Array.from(event.target.files ?? [])
            .filter((file) => /\.(md|markdown)$/i.test(file.name) && file.size <= 2 * 1024 * 1024)
            .slice(0, 250)
            .map((file) => ({
              path: file.webkitRelativePath || file.name,
              name: file.name,
              relativePath: file.webkitRelativePath || file.name,
              file,
            }))
            .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
          const rootName = documents[0]?.relativePath.split("/")[0] || "Workspace";
          const nextWorkspace = { path: null, name: rootName, documents };
          setWorkspace(nextWorkspace);
          setSidebarTab("files");
          setSidebarOpen(true);
          if (documents[0]) void openWorkspaceDocument(documents[0], nextWorkspace);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
