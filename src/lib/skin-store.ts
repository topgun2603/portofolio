/**
 * Which portfolio the visitor is looking at.
 *
 * "product" is the amber marketing site; "terminal" is the developer console.
 * Same content, two entirely different presentations. Like the experience mode
 * this lives on <html> so the pre-paint script can pick it before first paint,
 * and React reads it through useSyncExternalStore rather than an effect.
 */

export type Skin = "product" | "terminal";

export const SKIN_STORAGE_KEY = "flashlight-portfolio:skin";

let skin: Skin | null = null;
const listeners = new Set<() => void>();

export function getSkin(): Skin {
  if (skin === null) {
    skin = document.documentElement.dataset.skin === "terminal" ? "terminal" : "product";
  }
  return skin;
}

export function getServerSkin(): Skin {
  return "product";
}

export function setSkin(next: Skin) {
  if (skin === next) return;
  skin = next;
  document.documentElement.dataset.skin = next;
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, next);
  } catch {
    // blocked storage: the choice just does not survive a reload
  }
  for (const listener of listeners) listener();
}

export function subscribeSkin(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
