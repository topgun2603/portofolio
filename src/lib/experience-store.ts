/**
 * The experience mode lives outside React, in the DOM.
 *
 * An inline script sets `data-mode` on <html> before first paint so a returning
 * visitor never sees a flash of darkness. That makes the document the source of
 * truth, and `useSyncExternalStore` the honest way to read it: the server
 * snapshot is "booting", the client snapshot is whatever the script decided, and
 * React reconciles the two without a hydration mismatch or a setState-in-effect.
 */

export type Mode = "booting" | "intro" | "torch" | "flipping" | "lit";

export const SKIP_STORAGE_KEY = "flashlight-portfolio:lit";

let mode: Mode | null = null;
const listeners = new Set<() => void>();

export function getMode(): Mode {
  if (mode === null) {
    mode = document.documentElement.dataset.mode === "lit" ? "lit" : "intro";
  }
  return mode;
}

export function getServerMode(): Mode {
  return "booting";
}

export function setMode(next: Mode) {
  if (mode === next) return;
  mode = next;
  // CSS keys the entire palette off this attribute.
  document.documentElement.dataset.mode = next;
  for (const listener of listeners) listener();
}

export function subscribeMode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function rememberLit() {
  try {
    localStorage.setItem(SKIP_STORAGE_KEY, "1");
  } catch {
    // Private mode or blocked storage: the intro just replays. Not fatal.
  }
}

/** Undoes rememberLit, so a reload starts in the dark again. */
export function forgetLit() {
  try {
    localStorage.removeItem(SKIP_STORAGE_KEY);
  } catch {
    // nothing was stored anyway
  }
}
