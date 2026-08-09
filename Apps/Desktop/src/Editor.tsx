import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface EditorHandle {
  goToLine(line: number): void;
}

interface EditorProps {
  value: string;
  theme: "light" | "dark";
  showLineNumbers: boolean;
  onChange(value: string): void;
}

function editorTheme(theme: "light" | "dark") {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        color: "var(--hd-text)",
        backgroundColor: "var(--hd-pane-source)",
        fontSize: "14px",
      },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily: "var(--hd-font-mono)",
        lineHeight: "1.65",
      },
      ".cm-content": { padding: "28px max(24px, calc((100% - 760px) / 2)) 96px" },
      ".cm-gutters": {
        color: "var(--hd-text-faint)",
        backgroundColor: "var(--hd-rail)",
        borderRight: "1px solid var(--hd-border)",
      },
      ".cm-activeLine": { backgroundColor: "var(--hd-accent-soft)" },
      ".cm-activeLineGutter": { backgroundColor: "var(--hd-surface-muted)" },
      ".cm-selectionBackground, ::selection": { backgroundColor: "var(--hd-selection) !important" },
      ".cm-cursor": { borderLeftColor: "var(--hd-text)" },
      ".cm-focused": { outline: "none" },
    },
    { dark: theme === "dark" },
  );
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { value, theme, showLineNumbers, onChange },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useImperativeHandle(ref, () => ({
    goToLine(line) {
      const view = viewRef.current;
      if (!view) return;
      const safeLine = Math.min(Math.max(1, line), view.state.doc.lines);
      const position = view.state.doc.line(safeLine).from;
      view.dispatch({ selection: { anchor: position }, scrollIntoView: true });
      view.focus();
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: value,
        extensions: [
          ...(showLineNumbers ? [lineNumbers()] : []),
          highlightActiveLine(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          EditorView.lineWrapping,
          editorTheme(theme),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [showLineNumbers, theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  return <div ref={hostRef} className="source-editor" aria-label="Markdown source editor" />;
});
