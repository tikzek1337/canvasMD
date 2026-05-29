export {};

declare global {
  interface Window {
    canvasMDApi?: {
      saveJson: (payload: string) => Promise<{ ok: boolean; canceled?: boolean; path?: string }>;
      openJson: () => Promise<{ ok: boolean; canceled?: boolean; content?: string; path?: string }>;
    };
  }
}
