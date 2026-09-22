"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { SquareTerminal, Sparkles } from "lucide-react";
import {
  getServerSkin,
  getSkin,
  setSkin,
  subscribeSkin,
  type Skin,
} from "@/lib/skin-store";
import { useExperience } from "@/components/experience/experience-provider";

/** Near enough to the top that there is nothing worth animating. */
const AT_TOP_PX = 2;
/** Stop waiting for the scroll after this and swap anyway. */
const SCROLL_CAP_MS = 1400;

/**
 * Swaps between the marketing portfolio and the developer console.
 *
 * Switching to the console also turns the lights on: the torch intro belongs to
 * the product skin, and dropping someone into a pitch-black terminal with no
 * visible way out would be a trap rather than an easter egg.
 *
 * The swap waits for the page to scroll home first. Both skins open on
 * something worth watching - the console assembles its portrait out of a field
 * of digits the moment it mounts - and swapping in place from halfway down the
 * page plays that to an empty room, leaving the visitor somewhere in the middle
 * of a layout they have never seen.
 *
 * The wait is a frame loop watching `scrollY` rather than a fixed delay or the
 * `scrollend` event: a delay has to be guessed and is wrong on every page
 * length, and `scrollend` is still missing from older Safari. The cap covers
 * the case where the visitor grabs the page mid-flight and scroll never
 * reaches zero at all.
 */
export function SkinToggle() {
  const skin = useSyncExternalStore(subscribeSkin, getSkin, getServerSkin);
  const { isLit, skipIntro } = useExperience();
  const terminal = skin === "terminal";

  const frame = useRef(0);
  const busy = useRef(false);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const toggle = () => {
    if (busy.current) return;

    if (!isLit) skipIntro();
    const next: Skin = terminal ? "product" : "terminal";

    if (window.scrollY < AT_TOP_PX) {
      setSkin(next);
      return;
    }

    busy.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // "instant" rather than "auto": <html> carries scroll-behavior: smooth, and
    // "auto" defers to it - which is the one thing reduced motion rules out.
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });

    const startedAt = performance.now();
    const settle = () => {
      if (
        window.scrollY >= AT_TOP_PX &&
        performance.now() - startedAt < SCROLL_CAP_MS
      ) {
        frame.current = requestAnimationFrame(settle);
        return;
      }
      busy.current = false;
      setSkin(next);
    };

    frame.current = requestAnimationFrame(settle);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={terminal}
      className={
        terminal
          ? "flex shrink-0 items-center gap-2 rounded-sm border border-term-green/60 px-3 py-2 text-sm text-term-green transition-colors hover:bg-term-green/10"
          : "flex shrink-0 items-center gap-2 rounded-full border border-primary/45 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
      }
    >
      {terminal ? (
        <>
          <Sparkles className="size-4" />
          <span className="hidden sm:inline">[ Exit Console ]</span>
        </>
      ) : (
        <>
          <SquareTerminal className="size-4" />
          <span className="hidden sm:inline">Console</span>
        </>
      )}
    </button>
  );
}
