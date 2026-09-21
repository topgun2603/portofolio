import { BinaryPortrait } from "./binary-portrait";
import { identity } from "@/data/terminal";

/**
 * The portrait and the notes that sit beside it.
 *
 * Two columns, not one on top of the other. The notes used to be laid over the
 * canvas on a gradient scrim, which meant the figure was always partly behind
 * type - readable, but never clean, and the wider the window got the more of
 * him it covered. Giving each its own column costs a little canvas width and
 * removes the collision entirely.
 *
 * The photograph itself is never displayed - `public/gowtham-source.png` is
 * read pixel by pixel and redrawn as characters. That one is shot against
 * black, and the darkness is what separates him from the backdrop - see
 * `BACKGROUND_CUTOFF`. The lit skin wears the newer portrait; the console keeps
 * this one, which is the picture it was built around.
 */
export function PortraitStage() {
  return (
    <div className="relative flex min-w-0 flex-col p-5 sm:p-7 lg:p-0 lg:pr-7 lg:pt-7">
      <div className="grid flex-1 gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
        {/*
          The figure, with the whole of its own box to stand in.

          The height is not decoration. The portrait is 64 glyphs wide and 77
          tall, and the canvas sizes each glyph to whichever of the two axes
          runs out first - so height is always the binding constraint. Give it
          a short box and the cell drops to three or four pixels, at which point
          the face is technically still drawn and visually gone.
        */}
        <div className="relative min-h-[30rem] w-full overflow-hidden">
          <BinaryPortrait
            src="/gowtham-source.png"
            label={identity.portraitAlt}
            color="103, 248, 111"
            columns={64}
            sound
            hoverFire
            rain
            className="absolute inset-0"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-6 sm:w-[12.5rem]">
          <Quote />

          <p className="text-[10px] uppercase leading-[2] tracking-[0.34em] text-foreground sm:text-[11px]">
            {identity.creed.map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
            <span className="mt-2 block h-0.5 w-9 bg-primary" />
          </p>

          <p className="font-hand text-xl leading-tight text-primary sm:text-2xl">
            {identity.remote.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="mt-1 block h-0.5 w-24 rounded-full bg-primary/80" />
          </p>
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {identity.ticker.map((item, i) => (
          <li key={item} className="flex items-center gap-4">
            {i > 0 && <span aria-hidden="true" className="text-border">|</span>}
            {item}
          </li>
        ))}
        <li aria-hidden="true" className="ml-auto">
          <span className="caret bg-primary" />
        </li>
      </ul>
    </div>
  );
}

/** Stacked words between oversized quote marks, as the reference has them. */
function Quote() {
  return (
    <p className="relative pl-7 text-sm uppercase leading-[2.1] tracking-[0.22em] text-foreground">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[-0.35em] font-sans text-4xl leading-none text-primary"
      >
        &ldquo;
      </span>
      {identity.aside.map((word) => (
        <span key={word} className="block">
          {word}
        </span>
      ))}
      <span
        aria-hidden="true"
        className="ml-2 inline-block translate-y-3 font-sans text-4xl leading-none text-primary"
      >
        &rdquo;
      </span>
    </p>
  );
}
