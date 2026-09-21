"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  accents,
  getAccent,
  getServerAccent,
  setAccent,
  subscribeAccent,
  type Accent,
} from "@/lib/accent-store";

/**
 * Repaints the site in the visitor's colour.
 *
 * Deliberately not a shadcn `Popover`: that would pull in the Radix dependency
 * for one six-item menu, and everything this needs - outside click, Escape,
 * focus return - is a dozen lines.
 *
 * Only rendered on the product skin. The console overrides the accent with
 * phosphor green regardless, so a picker there would be a control that does
 * nothing.
 */
export function AccentPicker() {
  const accent = useSyncExternalStore(subscribeAccent, getAccent, getServerAccent);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Escape should leave focus where the visitor can carry on from, which is
      // the button that opened this - not wherever the menu happened to be.
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = accents.find((a) => a.id === accent) ?? accents[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Accent colour: ${current.label}. Change it`}
        title={`Accent: ${current.label}`}
        className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Palette className="size-4" />
      </button>

      {open && (
        <div
          role="group"
          aria-label="Accent colour"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-max rounded-xl border border-border bg-popover p-2 shadow-2xl"
        >
          <p className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Accent
          </p>

          <ul className="grid gap-0.5">
            {accents.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAccent(option.id as Accent);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  aria-pressed={option.id === accent}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                    option.id === accent
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0 rounded-full ring-1 ring-inset ring-white/20",
                      // The rainbow swatch keeps turning even where the theme
                      // itself holds still under reduced motion, because it is
                      // a 16px label rather than the whole page moving.
                      option.id === "rainbow" && "animate-[spin_6s_linear_infinite]",
                    )}
                    style={{ background: option.swatch }}
                  />
                  <span className="flex-1 whitespace-nowrap">{option.label}</span>
                  <Check
                    className={cn(
                      "size-3.5 shrink-0 text-primary",
                      option.id === accent ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
