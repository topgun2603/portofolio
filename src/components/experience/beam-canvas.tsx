"use client";

import { useEffect, useRef } from "react";
import {
  BASE_RADIUS,
  beam,
  computeRadius,
  distanceToRect,
  viewportDiagonal,
} from "@/lib/beam";
import { getMode } from "@/lib/experience-store";
import { useExperience } from "./experience-provider";

/**
 * The darkness.
 *
 * Canvas rather than a CSS radial-gradient overlay: animating a full-screen
 * gradient repaints the entire viewport every frame, which drops frames on
 * large displays. Here we fill a flat colour once and punch a hole with
 * `destination-out` - one cheap composite per frame, soft edge included.
 *
 * The warm tint is a separate GPU-composited layer (transform only, never
 * repainted) so the beam reads as light rather than as a hole.
 */
export function BeamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const torchRef = useRef<HTMLDivElement>(null);
  const { zonesRef, markDiscovered, mode } = useExperience();

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    const torch = torchRef.current;
    if (!canvas || !glow) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let frame = 0;
    let rectsDirty = true;

    const rects = new Map<string, DOMRect>();
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2); // 3x on phones buys nothing here
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rectsDirty = true;
      // Rotating a phone changes the short edge, and with it the beam size.
      if (beam.live && getMode() === "torch") beam.targetRadius = computeRadius();
    };

    // --- pointer ------------------------------------------------------------
    const setTarget = (clientX: number, clientY: number, touch: boolean) => {
      beam.pointerKind = touch ? "touch" : "mouse";
      beam.tx = clientX;
      // Lift the beam above the finger so the hand does not cover what it reveals.
      beam.ty = touch ? clientY - 70 : clientY;
    };

    const snapIfFirstSighting = () => {
      if (beam.x < -1000) {
        beam.x = beam.tx;
        beam.y = beam.ty;
      }
    };

    const onMove = (e: PointerEvent) => {
      const touch = e.pointerType === "touch" || e.pointerType === "pen";
      if (touch && !beam.dragging) return; // there is no hover on touch
      setTarget(e.clientX, e.clientY, touch);
      snapIfFirstSighting();
    };

    const onDown = (e: PointerEvent) => {
      const touch = e.pointerType === "touch" || e.pointerType === "pen";
      if (touch) beam.dragging = true;
      setTarget(e.clientX, e.clientY, touch);
      snapIfFirstSighting();
    };

    const onUp = () => {
      beam.dragging = false;
    };

    const onScroll = () => {
      rectsDirty = true;
    };

    // --- discovery ----------------------------------------------------------
    const scan = () => {
      const zones = zonesRef.current;
      if (!zones) return;

      // Zones register as their components mount, and the light switch only
      // mounts once the torch is picked up - so a size mismatch means the cache
      // predates a zone and has to be rebuilt, not just when the page moved.
      if (rectsDirty || rects.size !== zones.size) {
        rects.clear();
        for (const [id, el] of zones) rects.set(id, el.getBoundingClientRect());
        rectsDirty = false;
      }

      // 0.8 so a zone lights up when the beam properly lands on it, not when
      // the faint outer falloff grazes its corner.
      const reach = beam.radius * 0.8;
      for (const [id, rect] of rects) {
        if (distanceToRect(beam.x, beam.y, rect) < reach) markDiscovered(id);
      }
    };

    // --- loop ---------------------------------------------------------------
    const render = (t: number) => {
      raf = requestAnimationFrame(render);
      frame++;

      beam.x += (beam.tx - beam.x) * beam.ease;
      beam.y += (beam.ty - beam.y) * beam.ease;
      beam.radius += (beam.targetRadius - beam.radius) * beam.radiusEase;

      // Touch has no room to scroll while dragging, so the beam drags the page.
      if (coarse && beam.dragging && getMode() === "torch") {
        if (beam.ty < height * 0.16) window.scrollBy(0, -11);
        else if (beam.ty > height * 0.84) window.scrollBy(0, 11);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#05070b";
      ctx.fillRect(0, 0, width, height);

      if (beam.radius > 0.5) {
        // a live bulb is never perfectly steady
        const flicker = 1 + Math.sin(t / 143) * 0.012 + Math.sin(t / 61) * 0.007;
        const r = beam.radius * flicker;

        ctx.globalCompositeOperation = "destination-out";
        const g = ctx.createRadialGradient(beam.x, beam.y, 0, beam.x, beam.y, r);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.45, "rgba(0,0,0,0.97)");
        g.addColorStop(0.72, "rgba(0,0,0,0.72)");
        g.addColorStop(1, "rgba(0,0,0,0)"); // soft falloff, never a hard cutout
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(beam.x, beam.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }

      // Warm layer + torch glyph: transform only, so the compositor does it.
      const scale = (beam.radius / BASE_RADIUS).toFixed(3);
      const gx = Math.round(beam.x - BASE_RADIUS);
      const gy = Math.round(beam.y - BASE_RADIUS);
      glow.style.transform =
        "translate3d(" + gx + "px," + gy + "px,0) scale(" + scale + ")";
      glow.style.opacity = beam.live ? "1" : "0";

      if (torch) {
        torch.style.transform =
          "translate3d(" + Math.round(beam.x) + "px," + Math.round(beam.y) + "px,0)";
        torch.style.opacity =
          beam.live && beam.pointerKind === "mouse" && getMode() === "torch"
            ? "1"
            : "0";
      }

      if (beam.live && frame % 6 === 0) scan();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [zonesRef, markDiscovered]);

  // Keep the expansion target correct if the window resizes mid-cinematic.
  useEffect(() => {
    if (mode === "flipping") beam.targetRadius = viewportDiagonal() * 1.25;
  }, [mode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40"
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        // screen, not soft-light: over a near-black backdrop soft-light darkens
        // the very area the beam is meant to light up.
        className="pointer-events-none fixed left-0 top-0 z-40 opacity-0 mix-blend-screen will-change-transform"
        style={{
          width: BASE_RADIUS * 2,
          height: BASE_RADIUS * 2,
          // Warmth concentrated in a ring rather than the middle: a bright
          // centre washes out the very text the beam is uncovering, while a rim
          // still reads unmistakably as light spill.
          background:
            "radial-gradient(circle, rgba(255,214,150,0.07) 0%, rgba(255,207,135,0.15) 40%, rgba(255,198,120,0.07) 62%, rgba(255,190,110,0) 78%)",
        }}
      />
      <div
        ref={torchRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 -ml-2 -mt-2 h-4 w-4 rounded-full opacity-0 transition-opacity duration-300 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(255,246,225,1) 0%, rgba(255,214,150,0.85) 40%, rgba(255,200,120,0) 70%)",
          boxShadow: "0 0 18px 6px rgba(255,214,150,0.45)",
        }}
      />
    </>
  );
}
