"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { beam, computeRadius, resetBeam, viewportDiagonal } from "@/lib/beam";
import {
  forgetLit,
  getMode,
  getServerMode,
  rememberLit,
  setMode,
  subscribeMode,
  type Mode,
} from "@/lib/experience-store";
import { playSwitchFlip, playTorchOn } from "@/lib/sound";

export const SWITCH_ZONE_ID = "light-switch";
export type { Mode };

type ZoneMap = Map<string, HTMLElement>;

type ExperienceValue = {
  mode: Mode;
  /** the portfolio is fully visible and interactive */
  isLit: boolean;
  /** the dark overlay is mounted (intro, torch, or the flip cinematic) */
  isDark: boolean;
  discovered: ReadonlySet<string>;
  discoveredCount: number;
  switchFound: boolean;
  flashing: boolean;
  zonesRef: React.RefObject<ZoneMap>;
  registerZone: (id: string, el: HTMLElement) => () => void;
  markDiscovered: (id: string) => void;
  pickUpTorch: () => void;
  skipIntro: () => void;
  flipSwitch: () => void;
  replayIntro: () => void;
};

const ExperienceContext = createContext<ExperienceValue | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return ctx;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribeMode, getMode, getServerMode);
  const [discovered, setDiscovered] = useState<ReadonlySet<string>>(new Set());
  const [flashing, setFlashing] = useState(false);
  const zonesRef = useRef<ZoneMap>(new Map());

  const registerZone = useCallback((id: string, el: HTMLElement) => {
    const zones = zonesRef.current;
    zones.set(id, el);
    return () => {
      zones.delete(id);
    };
  }, []);

  const markDiscovered = useCallback((id: string) => {
    setDiscovered((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const pickUpTorch = useCallback(() => {
    if (getMode() !== "intro") return;
    playTorchOn();
    beam.live = true;
    beam.targetRadius = computeRadius();
    setMode("torch");
  }, []);

  const skipIntro = useCallback(() => {
    if (getMode() === "lit") return;
    rememberLit();
    resetBeam();
    setMode("lit");
  }, []);

  const flipSwitch = useCallback(async () => {
    if (getMode() !== "torch") return;
    // Fired first and scheduled on the audio clock, so the snap sits under the
    // rocker animation and the flood under the flash without chasing setTimeout.
    playSwitchFlip();
    setMode("flipping");
    rememberLit();

    // 1. the switch itself reacts
    await wait(340);
    // 2. soft flash
    setFlashing(true);
    // 3. the beam swallows the viewport; the rAF loop eases it out for us
    beam.radiusEase = 0.075;
    beam.targetRadius = viewportDiagonal() * 1.25;
    await wait(200);
    setFlashing(false);
    // 4. hand over to the lit portfolio
    await wait(720);
    resetBeam();
    setMode("lit");
  }, []);

  /**
   * Back to the dark. Without this the owner of the portfolio can never see
   * their own intro again once they have been through it once - the skip
   * memory is meant to spare returning recruiters, not lock everybody out.
   */
  const replayIntro = useCallback(() => {
    forgetLit();
    resetBeam();
    setDiscovered(new Set());
    window.scrollTo({ top: 0, behavior: "auto" });
    setMode("intro");
  }, []);

  // Keyboard users cannot play a torch game - give them the portfolio.
  useEffect(() => {
    if (mode === "lit" || mode === "booting") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === "Escape") skipIntro();
      if (e.key === "Enter" && getMode() === "intro") pickUpTorch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, skipIntro, pickUpTorch]);

  const isLit = mode === "lit";
  const isDark = mode === "intro" || mode === "torch" || mode === "flipping";

  const discoveredCount = useMemo(
    () => [...discovered].filter((id) => id !== SWITCH_ZONE_ID).length,
    [discovered],
  );

  const value = useMemo<ExperienceValue>(
    () => ({
      mode,
      isLit,
      isDark,
      discovered,
      discoveredCount,
      switchFound: discovered.has(SWITCH_ZONE_ID),
      flashing,
      zonesRef,
      registerZone,
      markDiscovered,
      pickUpTorch,
      skipIntro,
      flipSwitch,
      replayIntro,
    }),
    [
      mode,
      isLit,
      isDark,
      discovered,
      discoveredCount,
      flashing,
      registerZone,
      markDiscovered,
      pickUpTorch,
      skipIntro,
      flipSwitch,
      replayIntro,
    ],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}
