interface HypoDocDesktopBridge {
  openDocument(): Promise<{ path: string; name: string; content: string } | null>;
  saveDocument(input: { path: string | null; content: string }): Promise<{ path: string; name: string } | null>;
}

interface Window {
  hypodocDesktop?: HypoDocDesktopBridge;
}
