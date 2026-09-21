"use client";

import { useCallback } from "react";
import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { SWITCH_ZONE_ID, useExperience } from "./experience-provider";

/**
 * The light switch, living in the header instead of floating on a wall.
 *
 * It is the same element in all three states, which is why it registers itself
 * as a discovery zone: while the lights are off it is what the beam has to
 * find, and once they are on it becomes the way back into the dark. One
 * control, one place, no separate replay button buried in the footer.
 */
export function LightsButton() {
  const { isLit, mode, switchFound, discoveredCount, flipSwitch, replayIntro, registerZone } =
    useExperience();

  // Callback ref, not an effect: the header mounts before the experience knows
  // which mode it is in, and the element must register whenever it exists.
  const attach = useCallback(
    (el: HTMLButtonElement | null) => (el ? registerZone(SWITCH_ZONE_ID, el) : undefined),
    [registerZone],
  );

  const flipping = mode === "flipping";
  // 0 -> 1 as sections are found; how loudly the switch advertises itself.
  const hint = Math.min(discoveredCount / 3, 1);
  const armed = switchFound && !flipping;

  return (
    <motion.button
      ref={attach}
      type="button"
      onClick={isLit ? replayIntro : flipSwitch}
      disabled={!isLit && !armed}
      aria-label={
        isLit
          ? "Turn the lights off and replay the intro"
          : "Turn on the lights and reveal the full portfolio"
      }
      className="relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-default"
      style={{
        // Theme tokens, so the button follows whichever skin is showing.
        borderColor:
          isLit || armed ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)",
        color: isLit || armed ? "var(--primary)" : "var(--muted-foreground)",
      }}
      animate={{
        boxShadow: isLit
          ? "0 0 0 0 rgba(0,0,0,0)"
          : armed
            ? "0 0 26px 4px color-mix(in oklab, var(--primary) 34%, transparent)"
            : `0 0 ${8 + hint * 18}px ${hint * 3}px color-mix(in oklab, var(--primary) ${Math.round((0.06 + hint * 0.2) * 100)}%, transparent)`,
      }}
      whileHover={isLit || armed ? { scale: 1.03 } : undefined}
      whileTap={isLit || armed ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        aria-hidden="true"
        animate={flipping ? { rotate: 180, scale: 1.25 } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="grid place-items-center"
      >
        {isLit ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </motion.span>
      {/* On a phone the icon carries it; the label would crowd out the menu. */}
      <span className="hidden sm:inline">
        {isLit ? "Turn Off Lights" : "Turn On Lights"}
      </span>
    </motion.button>
  );
}
