"use client";

import { useSyncExternalStore } from "react";
import { SquareTerminal, Sparkles } from "lucide-react";
import { getServerSkin, getSkin, setSkin, subscribeSkin } from "@/lib/skin-store";
import { useExperience } from "@/components/experience/experience-provider";

/**
 * Swaps between the marketing portfolio and the developer console.
 *
 * Switching to the console also turns the lights on: the torch intro belongs to
 * the product skin, and dropping someone into a pitch-black terminal with no
 * visible way out would be a trap rather than an easter egg.
 */
export function SkinToggle() {
  const skin = useSyncExternalStore(subscribeSkin, getSkin, getServerSkin);
  const { isLit, skipIntro } = useExperience();
  const terminal = skin === "terminal";

  const toggle = () => {
    if (!isLit) skipIntro();
    setSkin(terminal ? "product" : "terminal");
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
