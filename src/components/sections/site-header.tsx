"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { LightsButton } from "@/components/experience/lights-button";
import { SkinToggle } from "@/components/terminal/skin-toggle";
import { AccentPicker } from "@/components/theme/accent-picker";
import { profile, navigation } from "@/data/portfolio";

/**
 * Always rendered, never faded out: while the lights are off the header is
 * part of what the torch uncovers, and the Turn On Lights button *is* the
 * switch the visitor is hunting for.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <a href="#hero" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/15 font-mono text-lg font-bold text-primary ring-1 ring-primary/30">
            {profile.initial}
          </span>
          <span className="leading-none">
            <span className="block text-sm font-bold tracking-[0.12em]">
              {profile.name.toUpperCase()}
            </span>
            <span className="mt-0.5 block text-[9px] tracking-[0.22em] text-muted-foreground">
              {profile.motto}
            </span>
          </span>
        </a>

        <ul className="mx-auto hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <li key={item.id}>
              <NavLink href={item.href}>{item.label}</NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <AccentPicker />
          <SkinToggle />
          <LightsButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            className="overflow-hidden border-t border-border/50 lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="mx-auto grid w-full max-w-7xl gap-1 px-4 py-3 sm:px-6">
              {navigation.map((item) => (
                <li key={item.id}>
                  <NavLink href={item.href} onClick={() => setOpen(false)} block>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Routes need next/link; in-page anchors must stay plain so hashes work. */
function NavLink({
  href,
  children,
  onClick,
  block,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  block?: boolean;
}) {
  const className = `rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground ${
    block ? "block" : ""
  }`;

  return href.startsWith("/") ? (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
