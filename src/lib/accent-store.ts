/**
 * Which accent the visitor has chosen.
 *
 * A theme here is not a palette - it is a single hue, and `globals.css` writes
 * every token in the lit palette against `--hue`. So this file moves one
 * attribute on <html> and the whole surface follows, cross-fading on the token
 * transition that the lights-on cinematic already uses.
 *
 * Same shape as the skin store: the value lives on <html> so the pre-paint
 * script in `layout.tsx` can set it before first paint, and React reads it
 * through useSyncExternalStore rather than an effect - an effect would run
 * after the first paint, which is exactly the flash being avoided.
 *
 * The console skin ignores all of this. It overrides `--primary` with phosphor
 * green outright, because a terminal that is not green is not a terminal.
 */

export const ACCENT_STORAGE_KEY = "flashlight-portfolio:accent";

/** The default. It is the initial value of `--hue`, so it needs no CSS rule. */
export const DEFAULT_ACCENT = "crimson";

export const accents = [
  { id: "crimson", label: "Crimson", swatch: "oklch(0.57 0.23 27)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.57 0.23 75)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.57 0.23 152)" },
  { id: "azure", label: "Azure", swatch: "oklch(0.57 0.23 245)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.57 0.23 305)" },
  {
    id: "rainbow",
    label: "Rainbow",
    // The swatch shows the whole sweep at once, which is the one honest way to
    // draw a theme that is a moving target.
    swatch:
      "conic-gradient(from 0deg, oklch(0.62 0.23 27), oklch(0.62 0.23 75), oklch(0.62 0.23 152), oklch(0.62 0.23 245), oklch(0.62 0.23 305), oklch(0.62 0.23 27))",
  },
] as const;

export type Accent = (typeof accents)[number]["id"];

const ids = accents.map((a) => a.id) as readonly string[];

/** Anything off this list is somebody else's string, not a theme. */
export function isAccent(value: unknown): value is Accent {
  return typeof value === "string" && ids.includes(value);
}

let accent: Accent | null = null;
const listeners = new Set<() => void>();

export function getAccent(): Accent {
  if (accent === null) {
    const set = document.documentElement.dataset.accent;
    accent = isAccent(set) ? set : DEFAULT_ACCENT;
  }
  return accent;
}

export function getServerAccent(): Accent {
  return DEFAULT_ACCENT;
}

export function setAccent(next: Accent) {
  if (accent === next) return;
  accent = next;

  // The default is the absence of the attribute rather than a value of its
  // own, so the markup for an untouched site stays exactly as it was.
  if (next === DEFAULT_ACCENT) delete document.documentElement.dataset.accent;
  else document.documentElement.dataset.accent = next;

  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, next);
  } catch {
    // blocked storage: the choice just does not survive a reload
  }

  for (const listener of listeners) listener();
}

export function subscribeAccent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
