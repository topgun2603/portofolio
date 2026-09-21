"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shot } from "@/data/portfolio";

/**
 * A carousel of screenshots, built on scroll-snap rather than a library.
 *
 * The browser already does the hard part: `overflow-x: auto` with
 * `scroll-snap-type: x mandatory` gives real momentum on a trackpad, a proper
 * swipe on a phone and arrow keys for free. All this adds on top is the two
 * buttons, the dots, and reading the scroll position back out so both of them
 * know which slide is showing - which is why the strip stays usable with
 * JavaScript still on the wire.
 *
 * The index comes from `scrollLeft` rather than from a piece of state the
 * buttons write to. A swipe moves the scroller without asking the component
 * first, so state that only the buttons update would drift out of sync with
 * what is on screen the moment anybody touched it.
 *
 * The caption sits over the foot of the image on a scrim rather than in a bar
 * beneath it: a card is a picture with a label, and a second horizontal rule
 * between the two only made it look like a form.
 */
export function ShotCarousel({
  shots,
  label,
  className,
  priority,
  sizes,
  children,
}: {
  shots: Shot[];
  /** What this is a carousel of, for the controls' accessible names. */
  label: string;
  className?: string;
  /** Set on the one carousel that is above the fold. */
  priority?: boolean;
  sizes: string;
  /** Chrome laid over the image - the monogram plate and the sector badge. */
  children?: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const id = useId();

  const single = shots.length < 2;

  // rAF-coalesced: a smooth scroll fires this far more often than there are
  // frames to paint, and every run is a layout read.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || single) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const width = track.clientWidth;
      if (!width) return;
      const next = Math.round(track.scrollLeft / width);
      setIndex((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [single]);

  const go = useCallback((to: number) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: to * track.clientWidth,
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  const shown = shots[Math.min(index, shots.length - 1)];

  return (
    <div className={cn("group/shots relative overflow-hidden", className)}>
      <div
        ref={trackRef}
        id={id}
        // A scroll container is only keyboard-reachable if it can take focus,
        // and arrow-key scrolling is the whole point of reaching it.
        tabIndex={single ? undefined : 0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${label} screenshots`}
        className="flex aspect-video w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((shot, i) => (
          // `overflow-hidden` per slide, so the hover zoom below is clipped by
          // its own slide instead of adding scroll width to the track.
          <div
            key={shot.src}
            className="relative w-full flex-none snap-center overflow-hidden"
          >
            <Image
              src={shot.src}
              alt={`${label}: ${shot.caption}`}
              fill
              sizes={sizes}
              priority={priority && i === 0}
              // `object-top`: a screenshot is read from its header down, and
              // centring one crops off the very thing that identifies the page.
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>

      {/* The scrim the caption and the dots are legible against. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/75 to-transparent"
      />

      {children}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-3 pb-2.5">
        {/*
          Not `aria-live`: the alt text already names the shot, and announcing
          the caption again on every swipe is noise.
        */}
        <p className="min-w-0 flex-1 truncate text-[11px] leading-snug text-muted-foreground">
          {shown.caption}
        </p>

        {!single && (
          <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
            {shots.map((shot, i) => (
              <button
                key={shot.src}
                type="button"
                aria-label={`Go to ${label} screenshot ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={cn(
                  "pointer-events-auto h-1.5 rounded-full transition-all duration-300",
                  i === index
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-muted-foreground/45 hover:bg-muted-foreground/80",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {!single && (
        <>
          <Arrow
            side="left"
            label={`Previous ${label} screenshot`}
            disabled={index === 0}
            onClick={() => go(index - 1)}
          />
          <Arrow
            side="right"
            label={`Next ${label} screenshot`}
            disabled={index === shots.length - 1}
            onClick={() => go(index + 1)}
          />
        </>
      )}
    </div>
  );
}

function Arrow({
  side,
  label,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        // Hidden until the card is hovered on a pointer device, always there on
        // touch - where hover does not exist and a swipe is the real control
        // anyway, so these are the fallback rather than the main event.
        "absolute top-[42%] grid size-8 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm transition duration-300 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-0",
        "opacity-0 group-hover/shots:opacity-100 [@media(hover:none)]:opacity-100",
        "hover:scale-110 hover:border-primary/60 hover:bg-black/80 hover:text-primary",
        side === "left" ? "left-2.5" : "right-2.5",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
