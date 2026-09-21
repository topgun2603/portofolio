"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Caret } from "./primitives";
import { CHAR_MS } from "@/lib/typing";
import { playKeystroke } from "@/lib/sound";

/**
 * Types a line out one character at a time.
 *
 * Every character is in the DOM from the first render and only its `opacity`
 * changes, which buys three things at once:
 *
 *  - the text is complete and in order for crawlers and assistive tech, with no
 *    duplicated copy (an `sr-only` twin made `h1.textContent` read
 *    "GowthamGowtham KumarKumar");
 *  - nothing reflows, because every glyph reserves its box up front;
 *  - the caret can sit exactly where the typing has got to.
 *
 * Spans are per character, so keep this for short lines - commands, headings,
 * taglines - not paragraphs.
 */
export function Typed({
  text,
  startDelay = 0,
  speed = CHAR_MS,
  caret = false,
  sound = false,
  className,
}: {
  text: string;
  startDelay?: number;
  speed?: number;
  /** Show a blinking block cursor at the typing position. */
  caret?: boolean;
  /**
   * Click a key per character. Silent while muted, and silent until the
   * browser lets the page play anything at all - see `primeAudio`.
   */
  sound?: boolean;
  className?: string;
}) {
  const characters = useMemo(() => Array.from(text), [text]);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Not synchronous: setting state straight from an effect body cascades a
      // render. A zero timer lands in the next tick and satisfies the rule.
      const skip = setTimeout(() => setShown(characters.length), 0);
      return () => clearTimeout(skip);
    }

    let index = 0;
    let tick: ReturnType<typeof setTimeout>;
    const begin = setTimeout(function step() {
      const character = characters[index];
      index += 1;
      setShown(index);

      // The space bar is the quiet key on any keyboard, and clicking on one
      // is what turns a typewriter into a Geiger counter.
      if (sound && character !== " ") playKeystroke();

      if (index < characters.length) tick = setTimeout(step, speed);
    }, startDelay);

    return () => {
      clearTimeout(begin);
      clearTimeout(tick);
    };
  }, [characters, speed, startDelay, sound]);

  return (
    <span className={cn("inline", className)}>
      {characters.map((character, i) => (
        <Fragment key={i}>
          {/*
            The caret is spliced in at the typing position rather than appended
            after the line. Because the untyped characters still hold their
            boxes, a trailing caret would sit at the far end of the reserved
            width instead of next to the text being typed.
          */}
          {caret && i === shown && <Caret className="mx-0.5" />}
          <span
            // `opacity`, not `visibility` or `display`: those drop the
            // character out of the accessibility tree, which is the whole
            // thing we are trying to keep.
            style={{ opacity: i < shown ? 1 : 0 }}
          >
            {character}
          </span>
        </Fragment>
      ))}
      {caret && shown === characters.length && <Caret className="ml-0.5" />}
    </span>
  );
}
