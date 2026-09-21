"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { imageToBinary, type BinaryCell } from "@/lib/image-to-binary";
import { playBinaryAssembly } from "@/lib/sound";

/** How many opacity steps the glyphs are quantised into. */
const LEVELS = 10;
/** Pointer reach, in CSS pixels. */
const POINTER_RADIUS = 170;
/** How long the field takes to assemble into a face. */
const INTRO_MS = 1500;
/** Line height of the falling backdrop columns, in CSS pixels. */
const RAIN_STEP = 15;
/** How far the figure is lifted off the bottom edge, in CSS pixels. */
const LIFT = 65;
/** Clear space kept above the figure, in CSS pixels. */
const TOP_MARGIN = 50;

/**
 * Ember to pale flame, coolest first. The glyphs themselves catch fire on
 * hover rather than a glow being painted behind them - the field *is* the
 * picture, so lighting it from the outside would just look like a filter.
 */
const FIRE = [
  [196, 46, 12],
  [228, 74, 14],
  [246, 104, 20],
  [255, 138, 30],
  [255, 172, 48],
  [255, 202, 82],
  [255, 230, 134],
  [255, 250, 208],
] as const;
const FIRE_STEPS = FIRE.length;
/** How fast the fire catches and dies back. */
const HEAT_EASE = 0.09;

type Particle = BinaryCell & {
  /** Where this glyph starts, before the field collapses into the portrait. */
  fromX: number;
  fromY: number;
  /** The glyph it shows while it is still noise. */
  noise: "0" | "1";
};

/**
 * The portrait, drawn as a live field of 0s and 1s.
 *
 * Pixels are analysed once (see `imageToBinary`); every frame only re-draws
 * characters, and never re-reads the image. Drawing is bucketed by opacity so
 * `fillStyle` is set ten times a frame instead of ~5,600 times: measured on
 * this grid that is 6.1ms/frame versus 17.5ms setting it per glyph, and versus
 * 21.3ms blitting a pre-rendered glyph atlas with `drawImage` - which sounds
 * cheaper and is not.
 */
export function BinaryPortrait({
  src,
  label,
  columns = 92,
  color = "0, 255, 150",
  className,
  sound = false,
  hoverFire = false,
  rain = false,
}: {
  src: string;
  /** Describes the image for anyone who cannot see the canvas. Omit it for a
   *  purely decorative layer, which is then hidden from assistive tech. */
  label?: string;
  columns?: number;
  /** RGB triplet the glyphs are drawn in. */
  color?: string;
  className?: string;
  /** Play the assembly cue when the field starts pulling together. */
  sound?: boolean;
  /** Set the glyphs alight while the pointer is over them. */
  hoverFire?: boolean;
  /** Draw falling columns of digits behind the portrait. */
  rain?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    // Positions live in parallel typed arrays so the draw loop allocates
    // nothing; the buckets hold indices into them.
    let drawX = new Float32Array(0);
    let drawY = new Float32Array(0);
    // One bucket per (fire step x opacity level). Without fire only the first
    // LEVELS are used, so the cool path costs exactly what it did before.
    const buckets: number[][] = Array.from(
      { length: FIRE_STEPS * LEVELS },
      () => [],
    );
    const palette: string[][] = Array.from({ length: FIRE_STEPS }, () =>
      new Array<string>(LEVELS),
    );

    const base = color.split(",").map((n) => Number(n.trim()));
    let heat = 0;
    let hovered = false;
    let portraitFont = "";
    let rainFont = "";

    // Backdrop rain shares this canvas rather than getting its own element and
    // animation loop - it is a few hundred more glyphs on a pass that already
    // draws several thousand.
    type RainColumn = { x: number; offset: number; speed: number; glyphs: string };
    let rainColumns: RainColumn[] = [];

    const buildRain = () => {
      if (!rain) return;
      // Evenly spaced columns on their own, smaller type. Randomly placed at
      // the portrait's own glyph size they just blurred into it instead of
      // reading as anything falling.
      const count = Math.max(4, Math.round(width / 78));
      const rows = Math.ceil(height / RAIN_STEP) + 8;
      rainColumns = Array.from({ length: count }, (_, i) => {
        let glyphs = "";
        for (let r = 0; r < rows; r++) glyphs += Math.random() < 0.5 ? "0" : "1";
        return {
          x: (i + 0.5) * (width / count),
          offset: Math.random() * height,
          speed: 26 + Math.random() * 62,
          glyphs,
        };
      });
    };

    let gridColumns = columns;
    let gridRows = 1;
    let cell = 1;
    let originX = 0;
    let originY = 0;
    let width = 0;
    let height = 0;
    let raf = 0;
    let frame = 0;
    let startedAt = 0;
    let cancelled = false;

    const pointer = { x: -9999, y: -9999 };
    let replayArmed = false;
    let onGesture: (() => void) | null = null;

    /**
     * Scatters the field and runs it back together, with sound if allowed.
     *
     * If autoplay policy refuses, the cue reports back and we wait for the
     * visitor's first gesture and do the whole thing again - picture and all.
     * Playing the sound alone at that point would be a noise with nothing
     * attached to it, and a cold load into the console (which is every reload
     * once the skin is remembered) never has a gesture behind it.
     */
    const beginAssembly = () => {
      startedAt = 0;
      const boxWidth = host.clientWidth || 400;
      const boxHeight = host.clientHeight || 500;
      for (const p of particles) {
        p.fromX = Math.random() * boxWidth;
        p.fromY = Math.random() * boxHeight;
      }

      if (!sound || reduced) return;
      void playBinaryAssembly().then((played) => {
        if (played || replayArmed || cancelled) return;
        replayArmed = true;
        onGesture = () => {
          onGesture = null;
          beginAssembly();
        };
        window.addEventListener("pointerdown", onGesture, { once: true });
        window.addEventListener("keydown", onGesture, { once: true });
      });
    };

    const layout = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The whole figure, always. Every previous attempt to make room for the
      // notes - cropping with a cover fit, then shifting the grid off the left
      // edge - cut him in half. The grid is fitted inside the box and never
      // offset past it; the notes are made readable with a backdrop instead.
      // The top margin is taken out of the available height before fitting, so
      // dropping the figure down the frame never costs a slice off his feet.
      const usableHeight = Math.max(1, height - TOP_MARGIN);
      cell = Math.min(width / gridColumns, usableHeight / gridRows);
      originX = Math.max(0, (width - cell * gridColumns) / 2);
      originY = TOP_MARGIN + Math.max(0, usableHeight - cell * gridRows - LIFT);

      const family = getComputedStyle(host).fontFamily;
      portraitFont = `${(cell * 1.05).toFixed(2)}px ${family}`;
      rainFont = `${(RAIN_STEP * 0.82).toFixed(2)}px ${family}`;
      ctx.font = portraitFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      buildRain();
    };

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      frame += 1;
      if (!startedAt) startedAt = now;

      // Intro: a random field of digits collapsing into the portrait.
      const progress = reduced ? 1 : Math.min(1, (now - startedAt) / INTRO_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      const glyph: "char" | "noise" = eased > 0.62 ? "char" : "noise";

      heat += ((hovered ? 1 : 0) - heat) * HEAT_EASE;
      const alight = heat > 0.01;

      if (alight) {
        // Blend the whole ramp once a frame; the inner loop then only picks an
        // index, so setting fill styles stays cheap however hot it gets.
        for (let step = 0; step < FIRE_STEPS; step++) {
          const [fr, fg, fb] = FIRE[step];
          const r = Math.round(base[0] + (fr - base[0]) * heat);
          const g = Math.round(base[1] + (fg - base[1]) * heat);
          const b = Math.round(base[2] + (fb - base[2]) * heat);
          for (let level = 0; level < LEVELS; level++) {
            palette[step][level] = `rgba(${r},${g},${b},${((level + 0.5) / LEVELS).toFixed(3)})`;
          }
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Behind everything, in its own smaller type, with a bright leading
      // character per column so it reads as falling rather than as static fuzz.
      if (rain && rainColumns.length) {
        const fade = 1 - heat * 0.75;
        const wrap = height + RAIN_STEP * 8;
        ctx.font = rainFont;

        ctx.fillStyle = `rgba(${color}, ${(0.055 * fade).toFixed(3)})`;
        for (const column of rainColumns) {
          const shift = (column.offset + (now / 1000) * column.speed) % wrap;
          for (let i = 0; i < column.glyphs.length; i++) {
            const y = shift - RAIN_STEP * 4 + i * RAIN_STEP;
            if (y < -RAIN_STEP || y > height + RAIN_STEP) continue;
            ctx.fillText(column.glyphs[i], column.x, y);
          }
        }

        ctx.fillStyle = `rgba(${color}, ${(0.26 * fade).toFixed(3)})`;
        for (const column of rainColumns) {
          const shift = (column.offset + (now / 1000) * column.speed) % wrap;
          const head = shift - RAIN_STEP * 4 + (column.glyphs.length - 1) * RAIN_STEP;
          if (head > -RAIN_STEP && head < height + RAIN_STEP) {
            ctx.fillText(column.glyphs[column.glyphs.length - 1], column.x, head);
          }
        }

        ctx.font = portraitFont;
      }

      for (const bucket of buckets) bucket.length = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const targetX = originX + p.col * cell + cell / 2;
        const targetY = originY + p.row * cell + cell / 2;
        const x = p.fromX + (targetX - p.fromX) * eased;
        const y = p.fromY + (targetY - p.fromY) * eased;

        // A slow diagonal wave keeps the field alive without moving anything.
        const wave = reduced
          ? 0.5
          : Math.abs(Math.sin(p.col * 0.35 + p.row * 0.22 + frame * 0.03));

        let alpha = 0.26 + wave * 0.3 + p.brightness * 0.34;

        if (pointer.x > -9000) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const influence = Math.max(
            0,
            1 - Math.sqrt(dx * dx + dy * dy) / POINTER_RADIUS,
          );
          alpha += influence * 0.55;
        }

        alpha *= eased; // the field fades in as it assembles
        if (alpha <= 0.02) continue;

        drawX[i] = x;
        drawY[i] = y;
        const level = Math.min(LEVELS - 1, Math.max(0, (alpha * LEVELS) | 0));

        if (!alight) {
          buckets[level].push(i);
          continue;
        }

        // Hottest at the base and licking upward, with two out-of-phase waves
        // so the flame wanders instead of pulsing in lockstep.
        const rowNorm = gridRows > 1 ? p.row / (gridRows - 1) : 1;
        const lick =
          Math.sin(p.col * 0.7 + frame * 0.11) * 0.5 +
          Math.sin(p.col * 0.31 - frame * 0.07) * 0.5;
        const temp = rowNorm * 0.88 + lick * 0.13 + 0.06;
        const step = Math.min(FIRE_STEPS - 1, Math.max(0, (temp * FIRE_STEPS) | 0));
        buckets[step * LEVELS + level].push(i);
      }

      const used = alight ? FIRE_STEPS * LEVELS : LEVELS;

      for (let b = 0; b < used; b++) {
        const bucket = buckets[b];
        if (!bucket.length) continue;
        ctx.fillStyle = alight
          ? palette[(b / LEVELS) | 0][b % LEVELS]
          : `rgba(${color}, ${((b + 0.5) / LEVELS).toFixed(3)})`;
        for (const i of bucket) {
          ctx.fillText(particles[i][glyph], drawX[i], drawY[i]);
        }
      }

    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      // Listening on window rather than the element, so hover is a bounds test.
      hovered =
        hoverFire &&
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= rect.width &&
        pointer.y <= rect.height;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      hovered = false;
    };

    const observer = new ResizeObserver(() => layout());

    imageToBinary(src, columns)
      .then((portrait) => {
        if (cancelled) return;

        gridColumns = portrait.columns;
        gridRows = portrait.rows;

        particles = portrait.cells.map((c) => ({
          ...c,
          fromX: 0,
          fromY: 0,
          noise: Math.random() < 0.5 ? "0" : "1",
        }));
        drawX = new Float32Array(particles.length);
        drawY = new Float32Array(particles.length);

        beginAssembly();
        layout();
        observer.observe(host);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerleave", onPointerLeave, { passive: true });
        raf = requestAnimationFrame(render);
      })
      .catch(() => {
        // A portrait that will not decode should not take the page with it.
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      if (onGesture) {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
      }
    };
  }, [src, columns, color, sound, hoverFire, rain]);

  return (
    <div
      ref={hostRef}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={cn("relative font-mono", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
