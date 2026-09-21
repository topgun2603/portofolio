import { cn } from "@/lib/utils";
import { shell } from "@/data/terminal";

/** The block cursor. White, the way a terminal's is. Pure CSS - see `caret`. */
export function Caret({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("caret ml-1 bg-foreground", className)} />;
}

/**
 * `gowtham@portfolio:~$`, coloured the way Git Bash colours it: user and host
 * in green, the path in yellow, punctuation left grey. One flat green string
 * looked like a screenshot filter rather than a shell.
 */
export function ShellPrompt({ className }: { className?: string }) {
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className="text-term-green">
        {shell.user}@{shell.host}
      </span>
      <span className="text-muted-foreground">:</span>
      <span className="text-term-yellow">{shell.path}</span>
      <span className="text-foreground">$</span>
    </span>
  );
}

/** A whole prompt line, optionally followed by the command that was run. */
export function Prompt({
  command,
  caret,
  className,
  children,
}: {
  command?: string;
  caret?: boolean;
  className?: string;
  /** A <Typed> command, when the line should be typed out rather than shown. */
  children?: React.ReactNode;
}) {
  return (
    <p className={cn("text-sm", className)}>
      <ShellPrompt />
      {command && <span className="ml-2 text-foreground">{command}</span>}
      {children && <span className="ml-2 text-foreground">{children}</span>}
      {caret && <Caret />}
    </p>
  );
}

/**
 * A bordered pane with a title bar, the way every section of the console is
 * framed. `chrome` adds the three window dots for the hero.
 */
export function Pane({
  title,
  chrome,
  className,
  bodyClassName,
  children,
  ...rest
}: Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode;
  chrome?: boolean;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}
      {...rest}
    >
      {(title || chrome) && (
        <header className="flex items-center gap-3 border-b border-border bg-white/[0.03] px-4 py-2.5">
          {chrome && (
            <span aria-hidden="true" className="flex shrink-0 gap-1.5">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
            </span>
          )}
          {title && (
            <span className="truncate text-xs text-muted-foreground">{title}</span>
          )}
        </header>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** `~/projects  (ls)` - a path in yellow, the command that made it in grey. */
export function PaneTitle({ path, command }: { path: string; command: string }) {
  return (
    <>
      <span className="text-term-yellow">{path}</span>
      <span className="ml-2 text-muted-foreground">({command})</span>
    </>
  );
}
