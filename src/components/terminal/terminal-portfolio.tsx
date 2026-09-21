import { SkinToggle } from "./skin-toggle";
import { SoundToggle } from "@/components/experience/sound-toggle";
import { ShellPrompt } from "./primitives";
import { TerminalHero } from "./terminal-hero";
import {
  TerminalClosing,
  TerminalProjects,
  TerminalSkills,
  TerminalUpdates,
  TerminalWelcome,
} from "./terminal-panes";
import { closing, terminalNav } from "@/data/terminal";
import { profile } from "@/data/portfolio";

/**
 * The developer-console skin. Same person, same projects, rendered as shell
 * output instead of as a marketing page. The torch intro does not run here -
 * the console is already the dark.
 */
export function TerminalPortfolio() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-[90rem] items-center gap-4 px-4 sm:px-6">
          <a href="#home" className="flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-6 place-items-center rounded-sm border border-term-green/60 text-[10px] text-term-green"
            >
              &gt;_
            </span>
            <ShellPrompt className="text-sm" />
          </a>

          <ul className="mx-auto hidden items-center gap-5 lg:flex">
            {terminalNav.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary"
                >
                  <span className="text-term-green">[{item.id}]</span> {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <SoundToggle variant="inline" />
            <SkinToggle />
          </div>
        </nav>

        <ul className="flex snap-x gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {terminalNav.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={item.href}
                className="text-foreground/80 transition-colors hover:text-primary"
              >
                <span className="text-term-green">[{item.id}]</span> {item.label}
              </a>
            </li>
          ))}
        </ul>
      </header>

      <main className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        <TerminalHero />
        <TerminalWelcome />
        <TerminalProjects />

        <div className="grid gap-5 lg:grid-cols-2">
          <TerminalSkills />
          <TerminalUpdates />
        </div>

        <TerminalClosing />
      </main>

      <footer className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs sm:px-6">
        <ShellPrompt />
        <span className="text-muted-foreground">
          {closing.footer} &copy; {new Date().getFullYear()} {profile.name}.
        </span>
      </footer>
    </>
  );
}
