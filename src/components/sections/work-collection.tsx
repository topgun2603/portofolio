import { ArrowUpRight, Layers, Rocket, Star, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShotCarousel } from "@/components/ui/shot-carousel";
import { RuledHeading } from "./about-services";
import { projects, stats, techStack, type Project } from "@/data/portfolio";
import { techMarks, type TechKey } from "@/components/icons/tech";

const statIcons: Record<string, LucideIcon> = {
  trophy: Trophy,
  layers: Layers,
  star: Star,
  rocket: Rocket,
};

/** `https://bugloop.srirealtime.com` reads as `bugloop.srirealtime.com`. */
function host(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/**
 * The work, led by the platform the rest of it ships under.
 *
 * Every card carries a carousel of the running product and the domain it is
 * running at, because that is the claim worth making here: these are
 * deployments a visitor can open and use, not mockups. The one entry with
 * nothing public behind it says so in those words rather than linking to `#`
 * and wasting a click.
 *
 * Note there is no whole-card link. The cards used to stretch the "Visit" link
 * over themselves, which is a good pattern right up until the card contains
 * controls of its own - a full-card overlay would swallow every press of a
 * carousel arrow.
 */
export function WorkCollection() {
  const [lead, ...rest] = projects;

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-[oklch(0.09_0.005_var(--hue))]">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <RuledHeading>
          Work <span className="text-primary">Collection</span>
        </RuledHeading>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Shipped products rather than concepts. Swipe through any of them, then
          open the running deployment.
        </p>

        <div className="relative mt-10">
          {/* the brush stroke the cards sit on */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[42%] w-[115%] -translate-x-1/2 -translate-y-1/2 -rotate-1 rounded-[50%] blur-2xl"
            style={{ background: "color-mix(in oklab, var(--primary) 30%, transparent)" }}
          />

          <LeadCard project={lead} />

          <ul className="relative mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((project, i) => (
              <ProjectCard key={project.name} project={project} index={i + 1} />
            ))}
          </ul>
        </div>

        <dl className="mt-10 grid divide-y divide-border rounded-xl border border-border bg-card/70 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {stats.map((stat) => {
            const Icon = statIcons[stat.icon];
            return (
              <div
                key={stat.label}
                className="flex items-center justify-center gap-3 px-4 py-5"
              >
                <Icon className="size-7 shrink-0 text-primary" strokeWidth={1.6} />
                <div>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-xl font-black">{stat.value}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

/**
 * The monogram plate, laid over the top-left of the screenshot. Each product
 * already brands itself with two letters; borrowing them gives the cards an
 * identity even where the shot is a sign-in page that looks like every other
 * sign-in page. Dark glass rather than the card's own palette, because it has
 * to hold against whatever is behind it.
 */
function Plate({ project, className }: { project: Project; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-xl border border-white/15 bg-black/55 font-mono font-black tracking-tight text-white shadow-lg backdrop-blur-md",
        className,
      )}
    >
      {project.monogram}
    </span>
  );
}

/** The sector, as a chip over the top-right of the screenshot. */
function Sector({ project }: { project: Project }) {
  return (
    <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/90 shadow-lg backdrop-blur-md">
      {project.sector}
    </span>
  );
}

/** The domain, with a light on it. */
function Host({ project, ping }: { project: Project; ping?: boolean }) {
  if (!project.href) {
    return (
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        In the workshop
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-2 font-mono text-[10px] text-muted-foreground">
      <span className="relative flex size-1.5 shrink-0">
        {/* One pulse on the page, on the lead card. Nine of them is a fairground. */}
        {ping && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70" />
        )}
        <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
      </span>
      <span className="truncate">{host(project.href)}</span>
    </span>
  );
}

/**
 * The link out, as a pill that fills on hover. The accessible name carries the
 * product, because nine links all reading "Visit" is useless in a screen
 * reader's list of links.
 */
function Visit({ project }: { project: Project }) {
  if (!project.href) {
    return (
      <span className="rounded-full border border-dashed border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Not public yet
      </span>
    );
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer noopener"
      className="group/visit inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
    >
      Visit<span className="sr-only"> {project.name}</span>
      <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/visit:-translate-y-0.5 group-hover/visit:translate-x-0.5" />
    </a>
  );
}

function Stack({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {project.stack.map((tool) => (
        <Badge
          key={tool}
          variant="outline"
          className="rounded-full border-border/80 bg-background/40 font-mono text-[10px] tracking-wide"
        >
          {tool}
        </Badge>
      ))}
    </div>
  );
}

/**
 * The parent platform, given the full width and its carousel side by side with
 * the copy. It is a different kind of thing from the products underneath it,
 * and a tenth identical card in the grid said the opposite.
 */
function LeadCard({ project }: { project: Project }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-primary/35 bg-card transition-shadow duration-500 hover:shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--primary)_55%,transparent)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--primary) 22%, transparent)" }}
      />

      <div className="relative grid lg:grid-cols-[1.1fr_1fr]">
        <ShotCarousel
          shots={project.shots}
          label={project.name}
          sizes="(min-width: 1024px) 620px, 94vw"
          className="border-b border-border/70 lg:border-b-0 lg:border-r"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
            <Plate project={project} className="size-11 text-sm" />
            <Sector project={project} />
          </div>
        </ShotCarousel>

        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Parent platform
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              {project.name}
            </h3>
            {/* the rule that ties the name to the accent, as the headings do */}
            <span
              aria-hidden="true"
              className="mt-3 block h-0.5 w-12 rounded-full bg-primary"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-primary">{project.tagline}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {project.blurb}
            </p>
          </div>

          <Stack project={project} />

          <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
            <Host project={project} ping />
            <Visit project={project} />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <li
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        "transition duration-500 ease-out hover:-translate-y-1 hover:border-primary/50",
        "hover:shadow-[0_20px_44px_-20px_color-mix(in_oklab,var(--primary)_50%,transparent)]",
        // A card with no screenshot has nothing to fill the height its
        // neighbours get from theirs, so it sits at the top of the row at its
        // own size. Stretched, it is a hollow box with a footer marooned at the
        // bottom of it.
        project.shots.length === 0 && "self-start",
      )}
    >
      {/* An accent rule that draws itself across the top on hover. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-gradient-to-r from-primary via-primary/70 to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100"
      />

      {/* No shots is a real state - see the note on `Project["shots"]`. */}
      {project.shots.length > 0 && (
        <ShotCarousel
          shots={project.shots}
          label={project.name}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 46vw, 92vw"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Plate project={project} className="size-9 text-[11px]" />
            <Sector project={project} />
          </div>
        </ShotCarousel>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight">
            {project.name}
          </h3>
          {/*
            The running number, the way the console skin lists them. It has to
            carry enough weight to read as a number - at a whisper it just looks
            like a smudge on the corner of the card.
          */}
          <span
            aria-hidden="true"
            className="shrink-0 font-mono text-sm font-black tabular-nums tracking-tight text-primary/55 transition-colors duration-500 group-hover:text-primary"
          >
            {String(index).padStart(2, "0")}
          </span>
        </div>

        <p className="mt-1.5 text-xs font-semibold text-primary">{project.tagline}</p>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {project.blurb}
        </p>

        <div className="mt-4">
          <Stack project={project} />
        </div>

        {/* `mt-auto` keeps the footers on one line across a row of uneven blurbs. */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <Host project={project} />
          <Visit project={project} />
        </div>
      </div>
    </li>
  );
}

/**
 * The stack, as a section rather than the hairline strip that used to close the
 * page. It sits ahead of the work now: the tools are the vocabulary the project
 * cards are written in, so a visitor who reads them first knows what the tags on
 * each card mean.
 *
 * Thirty-odd tools will not fit on one screen at a readable size, so the rows
 * scroll. Two of them, in opposite directions - one long row reads as a single
 * sliding object and is easy to stop seeing; two that disagree stay alive.
 */
export function TechStrip() {
  const half = Math.ceil(techStack.length / 2);

  return (
    <div id="skills" className="scroll-mt-20 border-t border-border/60">
      <div className="py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <RuledHeading>
            Technologies &amp; <span className="text-primary">Platforms</span>
          </RuledHeading>
        </div>

        <div className="mt-9 space-y-4">
          <TechMarquee items={techStack.slice(0, half)} />
          <TechMarquee items={techStack.slice(half)} reverse />
        </div>
      </div>
    </div>
  );
}

/**
 * One scrolling row. The list is rendered twice and the track travels exactly
 * half its width, so the second copy lands where the first began and the seam
 * never shows. The copy is `aria-hidden` - a screen reader should hear the
 * stack once, not twice.
 */
function TechMarquee({
  items,
  reverse,
}: {
  items: readonly string[];
  reverse?: boolean;
}) {
  const row = (clone?: boolean) => (
    <ul
      className={`marquee-row ${clone ? "marquee-clone" : ""}`}
      aria-hidden={clone || undefined}
    >
      {items.map((key) => {
        const { label, Mark } = techMarks[key as TechKey];
        return (
          <li
            key={key}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-card py-3.5 pl-4 pr-5 transition-colors hover:border-primary/60"
          >
            <Mark className="size-8 shrink-0" />
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.12em]">
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="marquee">
      <div className={`marquee-track ${reverse ? "marquee-track-reverse" : ""}`}>
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
