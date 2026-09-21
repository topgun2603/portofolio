"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "./experience-provider";
import {
  FIREWORKS_LAUNCH_MS,
  FIREWORKS_LEAD_MS,
  FIREWORKS_SHELLS,
  FIREWORKS_SPEED,
  playFireworks,
} from "@/lib/sound";

/** Shells go up over this stretch, once the lead-in has passed. */
const LAUNCH_MS = FIREWORKS_LAUNCH_MS;
/** How long the last sparks are given to burn out after the final shell. */
const TAIL_MS = Math.round(1400 / FIREWORKS_SPEED);
/** The whole display, measured from the moment the switch is thrown. */
const SHOW_MS = FIREWORKS_LEAD_MS + LAUNCH_MS + TAIL_MS;
/** Everything is up by here; after this only the burn-out is left. */
const LAST_SHELL_MS = FIREWORKS_LEAD_MS + LAUNCH_MS;
/** How far a shell may drift off its slot, so they do not fire on a metronome. */
const JITTER_MS = 180;
const SPARKS = 78;

/**
 * Downward pull and air resistance, per frame at 60fps.
 *
 * Both are written at full speed and then scaled, and the three exponents
 * below are not interchangeable: velocity goes with the speed factor,
 * gravity with its square because it is an acceleration, and drag to the
 * power of it because it compounds once per frame. Slowing the velocity
 * alone would leave the sparks falling like stones through treacle.
 */
const GRAVITY = 0.048 * FIREWORKS_SPEED * FIREWORKS_SPEED;
const DRAG = Math.pow(0.982, FIREWORKS_SPEED);

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 1 down to 0; doubles as the alpha. */
  life: number;
  decay: number;
  hue: number;
  light: number;
};

type Shell = {
  at: number;
  x: number;
  y: number;
  hue: number;
  fired: boolean;
};

/**
 * Fireworks, for the moment the lights come on.
 *
 * The display has to outlive the mode that starts it. `flipSwitch` only stays
 * in "flipping" for about 1.3 seconds before handing over to "lit", so
 * anything owned by an effect that depends on the mode gets torn down a
 * quarter of the way through: React runs the cleanup on the change,
 * `cancelAnimationFrame` stops the loop and the canvas is wiped - while the
 * audio, already scheduled on its own clock, carries on to the end. Two
 * bursts, eight bangs.
 *
 * So the canvas, the loop and the listeners belong to a mount-once effect and
 * are torn down only on unmount. The mode does nothing but pull the trigger.
 *
 * The bursts are pushed out towards the edges of the screen rather than
 * scattered evenly, so they frame whoever is reading instead of going off in
 * their face.
 */
export function Fireworks() {
  const { mode } = useExperience();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beginRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let startedAt = 0;
    let running = false;
    let shells: Shell[] = [];
    let sparks: Spark[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const burst = (shell: Shell) => {
      for (let i = 0; i < SPARKS; i++) {
        // Even angles with a jittered speed gives a round burst that still
        // looks thrown rather than compass-drawn.
        const angle = (i / SPARKS) * Math.PI * 2 + Math.random() * 0.1;
        const speed = (2.4 + Math.random() * 6.8) * FIREWORKS_SPEED;
        sparks.push({
          x: shell.x,
          y: shell.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: (0.006 + Math.random() * 0.01) * FIREWORKS_SPEED,
          hue: shell.hue + (Math.random() * 24 - 12),
          light: 58 + Math.random() * 28,
        });
      }
    };

    const render = (now: number) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      for (const shell of shells) {
        if (!shell.fired && elapsed >= shell.at) {
          shell.fired = true;
          burst(shell);
        }
      }

      ctx.clearRect(0, 0, width, height);
      // Sparks are light, so they add rather than paint over each other.
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      let alive = false;

      for (const s of sparks) {
        if (s.life <= 0) continue;
        alive = true;

        s.vx *= DRAG;
        s.vy = s.vy * DRAG + GRAVITY;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        const fade = Math.max(0, s.life);
        // Drawn as a short streak along its own heading - a dot moving this
        // fast reads as a flicker, a streak reads as a spark.
        ctx.strokeStyle = `hsla(${s.hue}, 100%, ${s.light}%, ${fade})`;
        ctx.lineWidth = 0.6 + fade * 2;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 2.4, s.y - s.vy * 2.4);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";

      if (elapsed < SHOW_MS && (alive || elapsed < LAST_SHELL_MS)) {
        raf = requestAnimationFrame(render);
        return;
      }

      // Done: leave the canvas clean so it is not a stale layer over the page.
      ctx.clearRect(0, 0, width, height);
      sparks = [];
      running = false;
    };

    const begin = () => {
      if (running) return;

      // Nobody asked for a party. A visitor on reduced motion gets the lights
      // on and nothing thrown at them.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      resize();

      // The accent the visitor picked, read at launch so the display belongs to
      // the page rather than arriving from a stock palette. `--hue` is a number.
      const accent =
        Number(
          getComputedStyle(document.documentElement).getPropertyValue("--hue").trim(),
        ) || 27;

      shells = Array.from({ length: FIREWORKS_SHELLS }, (_, i) => {
        // Left third or right third, with a couple allowed nearer the middle
        // but high up, out of the reading line.
        const edge =
          i % 2 === 0 ? 0.06 + Math.random() * 0.3 : 0.64 + Math.random() * 0.3;
        const centre = 0.36 + Math.random() * 0.28;
        const middling = i % 5 === 4;

        return {
          // The same slot and jitter the audio uses, so the bangs and the
          // bursts keep the same pace.
          at:
            FIREWORKS_LEAD_MS +
            (i / FIREWORKS_SHELLS) * LAUNCH_MS +
            Math.random() * JITTER_MS,
          x: (middling ? centre : edge) * width,
          y:
            (middling ? 0.1 + Math.random() * 0.12 : 0.16 + Math.random() * 0.4) *
            height,
          // Spread around the accent, with the odd shell in gold.
          hue: Math.random() < 0.25 ? 45 : accent + (Math.random() * 120 - 60),
          fired: false,
        };
      });

      sparks = [];
      startedAt = 0;
      running = true;

      // The frame is booked before the audio is touched. If a browser ever
      // objects to something in that graph, the display still goes up silently
      // rather than the throw taking the picture down with it.
      raf = requestAnimationFrame(render);
      playFireworks();
    };

    beginRef.current = begin;
    resize();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      beginRef.current = null;
      running = false;
    };
  }, []);

  // The mode's only job is to pull the trigger. Nothing it can tear down by
  // changing again lives in this effect.
  useEffect(() => {
    if (mode === "flipping") beginRef.current?.();
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // Under the white flash (z-70) so the first bursts are revealed as it
      // fades, and over everything else so they read against the dark.
      className="pointer-events-none fixed inset-0 z-[65]"
    />
  );
}
