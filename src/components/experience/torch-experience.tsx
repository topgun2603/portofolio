"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useExperience } from "./experience-provider";
import { BeamCanvas } from "./beam-canvas";
import { IntroScreen } from "./intro-screen";
import { SoundToggle } from "./sound-toggle";
import { discoveryZones } from "@/data/portfolio";

/**
 * Everything that only exists while the lights are off. Unmounts completely
 * once the portfolio is lit, so the finished site carries none of its cost.
 *
 * The light switch is not here: it lives in the header as the Turn On Lights
 * button, which is what the beam has to find.
 */
export function TorchExperience() {
  const { mode, isDark, flashing, skipIntro, discoveredCount, switchFound } =
    useExperience();

  // On touch there is nowhere to put both "move the torch" and "scroll", so
  // the torch wins and the beam auto-scrolls at the screen edges instead.
  useEffect(() => {
    const lock = mode === "torch" || mode === "flipping";
    document.body.style.touchAction = lock ? "none" : "";
    return () => {
      document.body.style.touchAction = "";
    };
  }, [mode]);

  if (!isDark) return null;

  return (
    <div aria-hidden={mode === "flipping" ? "true" : undefined}>
      <BeamCanvas />
      <IntroScreen />

      {/*
        Bottom of the screen, not the top: the header's Turn On Lights button is
        the switch, and these must never sit on top of the thing being hunted.
      */}
      <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 sm:bottom-6 sm:right-6">
        <SoundToggle />
        <button
          type="button"
          onClick={skipIntro}
          className="rounded-full border border-border bg-background/85 text-primary shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_18%,transparent)] backdrop-blur-sm hover:border-primary hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em]"
        >
          Skip intro
        </button>
      </div>

      {mode === "torch" && (
        <p className="pointer-events-none fixed bottom-16 left-4 z-50 font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.5_0.02_70)] sm:left-6">
          {switchFound
            ? "Flip the switch"
            : discoveredCount === 0
              ? "Move the light"
              : `${discoveredCount} of ${discoveryZones.length} found - find the switch`}
        </p>
      )}

      {/* the flash */}
      <AnimatePresence>
        {flashing && (
          <motion.div
            key="flash"
            className="pointer-events-none fixed inset-0 z-[70] bg-[oklch(0.99_0.04_88)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
            transition={{ duration: 0.12, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
