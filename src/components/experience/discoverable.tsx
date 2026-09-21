"use client";

import { useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useExperience } from "./experience-provider";

/**
 * Marks a slice of the portfolio as a discovery zone.
 *
 * The content is always in the DOM - the darkness is purely presentational, so
 * crawlers and screen readers see the complete portfolio regardless of whether
 * anyone ever picked up the torch. Discovery is sticky: once a zone has been
 * found it never goes dim again.
 */
export function Discoverable({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { registerZone, discovered, isLit } = useExperience();

  // Callback ref so a zone registers exactly when its element exists, and
  // unregisters when it does not - see the note in light-switch.tsx.
  const attach = useCallback(
    (el: HTMLElement | null) => (el ? registerZone(id, el) : undefined),
    [id, registerZone],
  );

  const revealed = isLit || discovered.has(id);

  return (
    <motion.section
      ref={attach}
      id={id}
      className={cn("scroll-mt-24", className)}
      initial={false}
      animate={
        revealed
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0.72, y: 14, filter: "blur(2px)" }
      }
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}
