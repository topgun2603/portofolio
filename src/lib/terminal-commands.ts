/**
 * The console's command set.
 *
 * Pure: a command returns lines plus an optional intent. Scrolling, clearing
 * and leaving the console are side effects the component performs, so this
 * module stays testable and free of DOM access.
 */

import { identity, infoLines, listing, skillTree } from "@/data/terminal";
import { profile } from "@/data/portfolio";

export type CommandResult = {
  lines: string[];
  /** Element id to scroll into view. */
  navigate?: string;
  /** Wipe the scrollback. */
  clear?: boolean;
  /** Leave the console for the product portfolio. */
  leave?: boolean;
  /** Open a URL in a new tab. */
  open?: string;
  /** How the output reads: red for a failure, grey for an aside. */
  tone?: "error" | "note";
  /** Hand this question to G0 and stream the answer back. */
  ask?: string;
};

type Command = {
  describe: string;
  run: (args: string[]) => CommandResult;
};

const pad = (value: string, width: number) => value.padEnd(width, " ");

export const commands: Record<string, Command> = {
  help: {
    describe: "list everything you can type here",
    run: () => ({
      lines: [
        "Available commands:",
        "",
        ...Object.entries(commands).map(
          ([name, c]) => `  ${pad(name, 12)} ${c.describe}`,
        ),
        "",
        "Tip: arrow up and down walks your history.",
      ],
    }),
  },

  whoami: {
    describe: "who you are talking to",
    run: () => ({
      lines: [
        identity.fullName,
        identity.title,
        "",
        ...infoLines.map((l) => `${pad(l.key, 10)}: ${l.value}`),
      ],
      navigate: "home",
    }),
  },

  about: {
    describe: "the short version",
    run: () => ({
      lines: [identity.mission, "", identity.rhythm.join(" . ")],
      navigate: "about",
    }),
  },

  projects: {
    describe: "what has actually shipped",
    run: () => ({
      lines: [
        ...listing.map(
          (p) =>
            `  ${p.id}  ${pad(p.name, 24)} ${pad(p.description, 42)} ${p.status}`,
        ),
        "",
        `${listing.length} entries. Try: open <name>`,
      ],
      navigate: "projects",
    }),
  },

  skills: {
    describe: "the stack, as a tree",
    run: () => ({
      lines: skillTree.flatMap((branch, i) => [
        `${i === skillTree.length - 1 ? "└──" : "├──"} ${branch.group}`,
        ...branch.items.map(
          (item, j) =>
            `${i === skillTree.length - 1 ? "   " : "│  "} ${
              j === branch.items.length - 1 ? "└──" : "├──"
            } ${item}`,
        ),
      ]),
      navigate: "skills",
    }),
  },

  contact: {
    describe: "how to reach me",
    run: () => ({
      lines: [`email   : ${profile.email}`, ...profile.socials.map((s) => `${pad(s.label.toLowerCase(), 8)}: ${s.href}`)],
      navigate: "contact",
    }),
  },

  open: {
    describe: "open a project, e.g. open bugloop",
    run: (args) => {
      const query = (args[0] ?? "").replace(/\/$/, "").toLowerCase();
      if (!query) return { lines: ["usage: open <project>"], tone: "error" };

      const match = listing.find((p) =>
        p.name.replace(/\/$/, "").toLowerCase().includes(query),
      );
      if (!match) {
        return { lines: [`open: no project matching '${query}'`], tone: "error" };
      }
      if (match.href === "#") {
        return {
          lines: [`${match.name} has no public link yet.`],
          tone: "note",
          navigate: "projects",
        };
      }
      return { lines: [`Opening ${match.name} ...`], open: match.href };
    },
  },

  ask: {
    describe: "ask G0 about Gowtham's work, e.g. ask why firebase",
    run: (args) => {
      const question = args.join(" ").trim();
      if (!question) {
        return { lines: ["usage: ask <question>"], tone: "error" };
      }
      return { lines: [], ask: question };
    },
  },

  resume: {
    describe: "download the CV",
    run: () => ({ lines: ["Fetching resume ..."], open: profile.resumeUrl }),
  },

  clear: {
    describe: "wipe the scrollback",
    run: () => ({ lines: [], clear: true }),
  },

  exit: {
    describe: "leave the console for the visual portfolio",
    run: () => ({ lines: ["Switching to the visual portfolio ..."], leave: true }),
  },

  sudo: {
    describe: "you already have the keys",
    run: () => ({
      lines: ["Permission granted. You were already an admin here."],
      tone: "note",
    }),
  },
};

/** Aliases that behave like a real shell would. */
const aliases: Record<string, string> = {
  ls: "projects",
  "ls projects/": "projects",
  cd: "projects",
  cat: "about",
  man: "help",
  "?": "help",
  quit: "exit",
  gui: "exit",
  me: "whoami",
  work: "projects",
  stack: "skills",
  email: "contact",
  cv: "resume",
  g0: "ask",
  ai: "ask",
};

export function runCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const normalised = aliases[input.toLowerCase()] ?? input;
  const [name, ...args] = normalised.split(/\s+/);
  const key = aliases[name.toLowerCase()] ?? name.toLowerCase();

  const command = commands[key];
  if (!command) {
    return {
      lines: [`${name}: command not found. Type 'help' for the list.`],
      tone: "error",
    };
  }
  return command.run(args);
}
