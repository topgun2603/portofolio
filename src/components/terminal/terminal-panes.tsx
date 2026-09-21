import { ArrowRight } from "lucide-react";
import { Pane, PaneTitle, Prompt } from "./primitives";
import { Typed } from "./typed";
import { typedSchedule } from "@/lib/typing";
import { closing, identity, listing, skillTree, updates } from "@/data/terminal";
import { profile } from "@/data/portfolio";

export function TerminalWelcome() {
  const [tWho, tMission, tStack] = typedSchedule([
    "whoami",
    "cat mission.txt",
    "cat stack.txt",
  ]);

  return (
    <Pane
      id="about"
      className="scroll-mt-24"
      title={<span className="text-term-cyan">Welcome to my portfolio</span>}
    >
      <div className="space-y-6">
        <div>
          <Prompt>
            <Typed text="whoami" startDelay={tWho} />
          </Prompt>
          <p className="mt-2 text-sm text-foreground/90">{identity.fullName}</p>
          <p className="text-sm text-foreground/90">{identity.title}</p>
        </div>

        <div>
          <Prompt>
            <Typed text="cat mission.txt" startDelay={tMission} />
          </Prompt>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/90">
            {identity.mission}
          </p>
        </div>

        <div>
          <Prompt>
            <Typed text="cat stack.txt" startDelay={tStack} />
          </Prompt>
          <p className="mt-2 text-sm text-foreground/90">{identity.stackLine}</p>
          <p className="text-sm text-foreground/90">
            {identity.rhythm.join(" • ")}
          </p>
        </div>

        <Prompt caret />
      </div>
    </Pane>
  );
}

export function TerminalProjects() {
  return (
    <Pane
      id="projects"
      className="scroll-mt-24"
      bodyClassName="p-0"
      title={<PaneTitle path="~/projects" command="ls" />}
    >
      <p className="border-b border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
        # Real products built with modern technologies
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th scope="col" className="py-2.5 pl-4 pr-3 font-normal sm:pl-5">
                <span className="sr-only">Index</span>
              </th>
              <th scope="col" className="py-2.5 pr-4 font-normal">
                <span className="sr-only">Name</span>
              </th>
              <th scope="col" className="py-2.5 pr-4 font-normal">
                <span className="sr-only">Description</span>
              </th>
              <th
                scope="col"
                className="border-l border-border py-2.5 pl-4 pr-4 font-normal"
              >
                stack
              </th>
              <th
                scope="col"
                className="border-l border-border py-2.5 pl-4 pr-4 font-normal sm:pr-5"
              >
                status
              </th>
            </tr>
          </thead>
          <tbody>
            {listing.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/50 transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <td className="py-2.5 pl-4 pr-3 align-top text-muted-foreground sm:pl-5">
                  {row.id}
                </td>
                <td className="py-2.5 pr-4 align-top">
                  <a href={row.href} className="text-term-blue hover:underline">
                    {row.name}
                  </a>
                </td>
                <td className="py-2.5 pr-4 align-top text-foreground/80">
                  {row.description}
                </td>
                <td className="border-l border-border py-2.5 pl-4 pr-4 align-top text-foreground/80">
                  {row.stack}
                </td>
                <td
                  className={`border-l border-border py-2.5 pl-4 pr-4 align-top sm:pr-5 ${
                    row.status === "Live" ? "text-term-green" : "text-term-yellow"
                  }`}
                >
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Pane>
  );
}

export function TerminalSkills() {
  return (
    <Pane
      id="skills"
      className="scroll-mt-24"
      title={<PaneTitle path="~/skills" command="tree" />}
    >
      <ul className="space-y-4 text-sm">
        {skillTree.map((branch, branchIndex) => {
          const lastBranch = branchIndex === skillTree.length - 1;
          return (
            <li key={branch.group}>
              <p className="flex gap-2">
                <span aria-hidden="true" className="text-muted-foreground">
                  {lastBranch ? "└──" : "├──"}
                </span>
                <span className="text-term-cyan">{branch.group}</span>
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {branch.items.map((item, itemIndex) => (
                  <li key={item} className="flex gap-2 text-foreground/85">
                    <span aria-hidden="true" className="pl-5 text-muted-foreground">
                      {lastBranch ? " " : "│"}
                    </span>
                    <span aria-hidden="true" className="text-muted-foreground">
                      {itemIndex === branch.items.length - 1 ? "└──" : "├──"}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </Pane>
  );
}

export function TerminalUpdates() {
  return (
    <Pane title={<PaneTitle path="~/latest" command="cat updates.log" />}>
      <ul className="space-y-3 text-sm">
        {updates.map((update) => (
          // Date and entry together: two things can land on one day, and a
          // changelog keyed on the date alone collapses them.
          <li
            key={`${update.date} ${update.entry}`}
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            <span className="text-term-yellow">[{update.date}]</span>
            <span className="text-foreground/85">{update.entry}</span>
          </li>
        ))}
      </ul>
      <Prompt caret className="mt-6" />
    </Pane>
  );
}

export function TerminalClosing() {
  return (
    <Pane id="contact" className="scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-lg text-term-yellow">
            &ldquo;<em className="not-italic">{closing.quote}</em>&rdquo;
          </p>
          <p className="mt-2 text-sm text-foreground/80">{closing.line}</p>
        </div>

        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-2 rounded-md bg-term-green px-6 py-3 text-sm font-semibold text-[oklch(0.16_0_0)] transition-opacity hover:opacity-90"
        >
          {closing.cta}
          <ArrowRight className="size-4" />
        </a>
      </div>
    </Pane>
  );
}
