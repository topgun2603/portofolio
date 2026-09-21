"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Flashlight } from "lucide-react";
import { useExperience } from "./experience-provider";
import { primeAudio } from "@/lib/sound";
// The console's typing primitive, reused rather than reimplemented: it keeps
// the whole line in the DOM from the first render, so the intro still reads as
// plain text to a crawler that never waits for the animation.
import { Typed } from "@/components/terminal/typed";

const LEAD = "You seem ";
const ACCENT = "curious...";
const QUOTE = "“Every line of code tells a story. Let’s uncover mine.”";

/**
 * The opening beats, in milliseconds from the moment the intro mounts.
 *
 * Derived from the copy rather than hand-tuned, so rewording a line moves
 * everything after it instead of quietly overlapping the next beat.
 */
const TITLE_SPEED = 45;
const QUOTE_SPEED = 16;

const TITLE_AT = 350;
const ACCENT_AT = TITLE_AT + LEAD.length * TITLE_SPEED;
const TITLE_END = ACCENT_AT + ACCENT.length * TITLE_SPEED;
const QUOTE_AT = TITLE_END + 260;
const QUOTE_END = QUOTE_AT + QUOTE.length * QUOTE_SPEED;
/** The deliberate hold after the quote, before the invitation begins. */
const BEAT = 1000;
const DISCOVER_AT = QUOTE_END + BEAT;
const TORCH_AT = DISCOVER_AT + 620;
const LABEL_AT = TORCH_AT + 430;
const TAGLINE_AT = LABEL_AT + 320;

const seconds = (ms: number) => ms / 1000;

export function IntroScreen() {
  const { mode } = useExperience();

  return (
    <AnimatePresence>
      {/*
        Keyed on the mode so a replayed intro remounts and runs the sequence
        again from the top, rather than resuming with every line already typed.
      */}
      {mode === "intro" && <IntroSequence key="intro" />}
    </AnimatePresence>
  );
}

function IntroSequence() {
  const { pickUpTorch } = useExperience();

  // Every line is mounted from the start and only fades in, so the column never
  // reflows mid-sentence. That leaves the torch on screen - invisible - before
  // its cue, so interactivity is gated separately from opacity.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cue = setTimeout(() => setArmed(true), reduced ? 0 : TORCH_AT);
    // The keys are typing before anyone has clicked anything, which is
    // exactly the state in which a browser refuses to play a sound. This
    // hands the context the first gesture that does arrive.
    const release = primeAudio();
    return () => {
      clearTimeout(cue);
      release();
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <h1 className="font-mono text-[clamp(1.5rem,4.6vw,2.9rem)] font-bold tracking-tight">
        <Typed
          text={LEAD}
          startDelay={TITLE_AT}
          speed={TITLE_SPEED}
          sound
          className="text-[oklch(0.95_0.01_80)]"
        />
        <Typed
          text={ACCENT}
          startDelay={ACCENT_AT}
          speed={TITLE_SPEED}
          caret
          sound
          className="text-primary"
        />
      </h1>

      <p className="mt-5 max-w-xl font-mono text-[clamp(0.72rem,1.7vw,0.9rem)] leading-relaxed text-[oklch(0.5_0.012_70)]">
        <Typed text={QUOTE} startDelay={QUOTE_AT} speed={QUOTE_SPEED} sound />
      </p>

      <motion.p
        className="mt-7 font-mono text-[clamp(0.85rem,2vw,1.05rem)] text-[oklch(0.72_0.012_70)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: seconds(DISCOVER_AT), duration: 0.85, ease: "easeOut" }}
      >
        Some things are worth discovering.
      </motion.p>

      <motion.div
        className="relative mt-12 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: seconds(TORCH_AT), duration: 0.8, ease: "easeOut" }}
      >
        {/* The light the torch is already spilling on the floor beneath it. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[76%] h-40 w-[34rem] max-w-[86vw] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,204,130,0.16) 0%, rgba(255,196,120,0.05) 38%, rgba(255,190,110,0) 72%)",
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.button
          type="button"
          onClick={pickUpTorch}
          // Present but inert until its cue: an invisible button that can still
          // be clicked or tabbed into is a trap, not an intro.
          tabIndex={armed ? 0 : -1}
          aria-hidden={armed ? undefined : true}
          className={`group relative flex h-32 w-32 items-center justify-center rounded-full outline-none ${
            armed ? "" : "pointer-events-none"
          }`}
          aria-label="Pick up the torch and explore the portfolio"
          whileHover={armed ? { scale: 1.06 } : undefined}
          whileTap={armed ? { scale: 0.96 } : undefined}
        >
          {/* the torch's own resting halo */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,214,150,0.30) 0%, rgba(255,200,120,0) 70%)",
            }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Flashlight
            className="relative h-11 w-11 -rotate-45 text-[oklch(0.92_0.07_85)] drop-shadow-[0_0_14px_rgba(255,214,150,0.7)] transition-transform duration-500 group-hover:-rotate-12"
            strokeWidth={1.25}
          />
        </motion.button>

        <motion.p
          className="mt-2 font-mono text-sm font-medium uppercase tracking-[0.32em] text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: seconds(LABEL_AT), duration: 0.7, ease: "easeOut" }}
        >
          Pick up the torch
        </motion.p>

        <motion.p
          className="mt-3 font-mono text-[11px] tracking-[0.1em] text-[oklch(0.5_0.01_70)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: seconds(TAGLINE_AT), duration: 0.9, ease: "easeOut" }}
        >
          Explore. Discover. Know me better.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
