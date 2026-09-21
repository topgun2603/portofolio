import { Download, Mail, Play } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand";
import { Pane, Prompt, ShellPrompt } from "./primitives";
import { Typed } from "./typed";
import { CHAR_MS, typedSchedule } from "@/lib/typing";
import { PortraitStage } from "./portrait-stage";
import { CommandLine } from "./command-line";
import { identity, infoLines, listing } from "@/data/terminal";
import { profile } from "@/data/portfolio";

const actions = [
  { label: "View Projects", href: "#projects", Icon: Play },
  { label: "Download CV", href: profile.resumeUrl, Icon: Download },
  { label: "GitHub", href: profile.socials[0].href, Icon: GithubIcon },
  { label: "LinkedIn", href: profile.socials[1].href, Icon: LinkedinIcon },
  { label: "Email Me", href: `mailto:${profile.email}`, Icon: Mail },
];

/**
 * The console's opening screen: who, then what, then a prompt you can type into.
 *
 * Two rows rather than two columns. The listing used to sit inside the
 * left-hand column beside the portrait, which left it about a third of the
 * window wide - every description wrapped onto three lines and every project
 * name broke in half, while the middle of the pane sat empty. It now spans the
 * full width underneath, which is also how `ls` actually behaves: it uses the
 * terminal it is given.
 */
export function TerminalHero() {
  const [first, ...rest] = identity.fullName.split(" ");
  const rhythm = identity.rhythm.map((word) => word + " .").join(" ");

  // One sequence, so the hero types itself out top to bottom.
  const [tWhoami, tName, tTitle, tRhythm, tLs] = typedSchedule([
    "whoami",
    identity.fullName,
    identity.title,
    rhythm,
    "ls projects/",
  ]);

  return (
    <Pane
      id="home"
      chrome
      title={<ShellPrompt />}
      bodyClassName="relative p-0"
      className="scroll-mt-24"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="relative z-10 min-w-0 p-5 sm:p-7">
          <Prompt>
            <Typed text="whoami" startDelay={tWhoami} caret />
          </Prompt>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <Typed text={first} startDelay={tName} className="text-term-green" />
            <span aria-hidden="true"> </span>
            <Typed
              text={rest.join(" ")}
              startDelay={tName + first.length * CHAR_MS + 40}
              className="text-foreground"
            />
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-foreground/90 sm:text-base">
            <Typed text={identity.title} startDelay={tTitle} />
          </p>

          <p className="mt-3 text-lg text-term-green sm:text-xl">
            <Typed text={rhythm} startDelay={tRhythm} caret />
          </p>

          <dl className="mt-7 space-y-2 text-sm">
            {infoLines.map((line) => (
              <div key={line.key} className="flex gap-3">
                <dt className="flex shrink-0 gap-2">
                  <span aria-hidden="true" className="text-muted-foreground">
                    &gt;
                  </span>
                  <span className="w-[4.5rem] text-term-cyan">{line.key}</span>
                  <span className="text-muted-foreground">:</span>
                </dt>
                <dd className="text-foreground/90">{line.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-7 flex flex-wrap gap-3">
            {actions.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 rounded-md border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:border-term-green/70 hover:bg-term-green/10 hover:text-term-green"
                >
                  <Icon className="size-4 text-term-green" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <PortraitStage />
      </div>

      {/* `ls projects/`, across the whole window, with a live prompt under it */}
      <div className="border-t border-border">
        <div className="border-b border-border px-4 py-2.5 sm:px-5">
          <Prompt className="text-xs">
            <Typed text="ls projects/" startDelay={tLs} />
          </Prompt>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left text-xs sm:text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-dashed border-border">
                <th scope="col" className="w-10 py-2 pl-4 pr-3 font-normal sm:pl-5">
                  ID
                </th>
                <th scope="col" className="py-2 pr-6 font-normal">
                  NAME
                </th>
                {/* The one column with anything to say gets whatever is left. */}
                <th scope="col" className="w-full py-2 pr-6 font-normal">
                  DESCRIPTION
                </th>
                <th scope="col" className="py-2 pl-4 pr-4 font-normal sm:pr-5">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {listing.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/40 transition-colors last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="py-2 pl-4 pr-3 align-top text-muted-foreground sm:pl-5">
                    {row.id}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-6 align-top">
                    <a href={row.href} className="text-term-blue hover:underline">
                      {row.name}
                    </a>
                  </td>
                  <td className="py-2 pr-6 align-top text-foreground/80">
                    {row.description}
                  </td>
                  <td className="whitespace-nowrap py-2 pl-4 pr-4 align-top sm:pr-5">
                    <span
                      className={
                        row.status === "Live" ? "text-term-green" : "text-term-yellow"
                      }
                    >
                      [ {row.status === "Live" ? "Live" : "..."} ]
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CommandLine className="border-t border-border" />
      </div>
    </Pane>
  );
}
