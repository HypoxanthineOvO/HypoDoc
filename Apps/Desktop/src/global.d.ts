interface HypoDocWorkspaceEntry {
  path: string;
  name: string;
  relativePath: string;
}

interface HypoDocDesktopBridge {
  openDocument(): Promise<{ path: string; name: string; content: string } | null>;
  openWorkspace(): Promise<{ path: string; name: string; documents: HypoDocWorkspaceEntry[] } | null>;
  readWorkspaceDocument(path: string): Promise<{ path: string; name: string; content: string }>;
  saveDocument(input: { path: string | null; content: string }): Promise<{ path: string; name: string } | null>;
}

interface Window {
  hypodocDesktop?: HypoDocDesktopBridge;
}
