"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServerMuted, isMuted, setMuted, subscribeMuted } from "@/lib/sound";

/**
 * Sound a visitor did not ask for is hostile, so it always has a visible way
 * out. One control for both skins - the same mute governs the torch cues and
 * the console's portrait assembly.
 *
 * `floating` sits over the darkness during the intro and needs its own glow to
 * be findable; `inline` lives in the console header and takes the surrounding
 * palette from the theme tokens.
 */
export function SoundToggle({
  variant = "floating",
}: {
  variant?: "floating" | "inline";
}) {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, getServerMuted);

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      title={muted ? "Sound off" : "Sound on"}
      className={cn(
        "grid size-9 shrink-0 place-items-center transition focus-visible:outline-2 focus-visible:outline-offset-2",
        variant === "floating"
          ? "rounded-full border border-border bg-background/85 text-primary shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_18%,transparent)] backdrop-blur-sm hover:border-primary hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          : "rounded-sm border border-border text-muted-foreground hover:border-primary/60 hover:text-primary focus-visible:outline-primary",
      )}
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}
