"use client";

import { useCallback, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Caret, ShellPrompt } from "./primitives";
import { commands, runCommand, type CommandResult } from "@/lib/terminal-commands";

import { setSkin } from "@/lib/skin-store";

type Entry = {
  id: number;
  command: string;
  lines: string[];
  tone?: CommandResult["tone"];
  /** True while G0 is still streaming its answer into this entry. */
  pending?: boolean;
};

/** What G0 has been told so far this session, for follow-up questions. */
type Turn = { role: "user" | "assistant"; content: string };

/**
 * A working command line: `help`, `projects`, `skills`, `open bugloop`, `exit`.
 *
 * Commands themselves live in `lib/terminal-commands.ts` and are pure - they
 * return lines plus an intent, and this component is the only thing that
 * touches the DOM. Arrow keys walk the history and Tab completes a name, because
 * anyone who types into a terminal will try both within ten seconds.
 */
export function CommandLine({ className }: { className?: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);

  const conversation = useRef<Turn[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const inputId = useId();

  /**
   * Streams G0's answer straight into the entry that asked for it, so the
   * console fills line by line the way real output does.
   */
  const askG0 = useCallback(async (entryId: number, question: string) => {
    const history = [...conversation.current, { role: "user" as const, content: question }];
    const settle = (text: string, tone?: CommandResult["tone"]) =>
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, lines: text.split("\n"), tone, pending: false } : e,
        ),
      );

    try {
      const response = await fetch("/api/g0", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok || !response.body) {
        settle(await response.text().catch(() => "G0 is unreachable."), "error");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? { ...e, lines: answer.split("\n") } : e)),
        );
      }

      settle(answer.trim() || "G0 had nothing to say.");
      conversation.current = [
        ...history,
        { role: "assistant" as const, content: answer },
      ].slice(-8);
    } catch {
      settle("G0 is unreachable.", "error");
    }
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const command = raw.trim();
      const result = runCommand(command);

      setHistory((h) => (command ? [command, ...h].slice(0, 50) : h));
      setCursor(-1);
      setValue("");

      if (result.clear) {
        setEntries([]);
      } else {
        const id = nextId.current++;
        setEntries((prev) => [
          ...prev,
          {
            id,
            command,
            lines: result.ask ? ["..."] : result.lines,
            tone: result.tone,
            pending: Boolean(result.ask),
          },
        ]);
        if (result.ask) void askG0(id, result.ask);
      }

      if (result.navigate) {
        document
          .getElementById(result.navigate)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (result.open) window.open(result.open, "_blank", "noopener,noreferrer");
      if (result.leave) setSkin("product");

      // Keep the newest output in view without moving the page around the user.
      requestAnimationFrame(() => {
        const box = scrollRef.current;
        if (box) box.scrollTop = box.scrollHeight;
      });
    },
    [askG0],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) {
        setCursor(next);
        setValue(history[next]);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next >= 0 ? history[next] : "");
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const partial = value.trim().toLowerCase();
      if (!partial) return;
      const match = Object.keys(commands).find((name) => name.startsWith(partial));
      if (match) setValue(match);
      return;
    }
    if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setEntries([]);
    }
  };

  return (
    <div
      className={cn("text-xs", className)}
      onClick={() => inputRef.current?.focus()}
    >
      {entries.length > 0 && (
        <div
          ref={scrollRef}
          aria-live="polite"
          className="max-h-56 space-y-3 overflow-y-auto border-b border-border px-4 py-3"
        >
          {entries.map((entry) => (
            <div key={entry.id}>
              <p>
                <ShellPrompt />
                <span className="ml-2 text-foreground">{entry.command}</span>
              </p>
              {entry.lines.length > 0 && (
                <pre
                  className={cn(
                    "mt-1 whitespace-pre-wrap font-[inherit] leading-relaxed",
                    entry.tone === "error"
                      ? "text-term-red"
                      : entry.tone === "note"
                        ? "text-muted-foreground"
                        : "text-foreground/85",
                  )}
                >
                  {entry.lines.join("\n")}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <form
        className="flex items-center gap-2 px-4 py-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
      >
        <label htmlFor={inputId} className="shrink-0">
          <ShellPrompt />
          <span className="sr-only">Terminal command</span>
        </label>

        {/*
          The input's own text is transparent and a mirrored span is painted
          instead, so the line can end in a solid block cursor rather than the
          browser's thin one.
        */}
        <span className="relative min-w-0 flex-1">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center whitespace-pre text-foreground"
          >
            {value}
            <Caret className="ml-0.5" />
            {!value && (
              <span className="ml-2 text-muted-foreground/70">type &lsquo;help&rsquo;</span>
            )}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="w-full bg-transparent text-transparent caret-transparent outline-none"
          />
        </span>
      </form>
    </div>
  );
}
