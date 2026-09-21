import {
  Brain,
  CalendarCheck,
  Clock,
  Code2,
  Database,
  Gauge,
  Globe,
  Layers,
  PenTool,
  Server,
  type LucideIcon,
} from "lucide-react";
import { aboutPoints, aiStatement, profile, services } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const pointIcons: Record<string, LucideIcon> = {
  globe: Globe,
  clock: Clock,
  pen: PenTool,
  calendar: CalendarCheck,
};

const serviceIcons: Record<string, LucideIcon> = {
  code: Code2,
  saas: Layers,
  ai: Brain,
  server: Server,
  database: Database,
  speed: Gauge,
};

/** `—— SERVICES ——`, the rule-and-dot heading the whole page uses. */
export function RuledHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`flex items-center justify-center gap-4 text-2xl font-black uppercase tracking-[0.18em] sm:text-3xl ${className ?? ""}`}
    >
      <Rule />
      <span>{children}</span>
      <Rule flipped />
    </h2>
  );
}

function Rule({ flipped }: { flipped?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex flex-1 items-center gap-2 ${flipped ? "flex-row-reverse" : ""}`}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary" />
      <span className="size-1.5 shrink-0 rotate-45 bg-primary" />
    </span>
  );
}

export function AboutAndServices() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
          About Me
        </p>
        <p className="mt-2 text-5xl font-black uppercase tracking-tight sm:text-6xl">
          Me
        </p>

        {/*
          Both halves of the AI statement, not the hero's pitch. `profile.intro`
          is already the first thing a visitor reads at the top of the page;
          repeating it here wasted the one paragraph that gets to say something
          the hero cannot - how the work actually gets done.
        */}
        {aiStatement.paragraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={cn(
              "max-w-md text-sm leading-relaxed text-muted-foreground",
              index === 0 ? "mt-5" : "mt-4",
            )}
          >
            {paragraph}
          </p>
        ))}

        <ul className="mt-7 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {aboutPoints.map((point) => {
            const Icon = pointIcons[point.icon];
            return (
              <li key={point.title} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.1em]">
                  {point.title}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 font-hand text-3xl text-foreground">{profile.fullName}</p>
      </div>

      <div>
        <RuledHeading>Services</RuledHeading>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon];
            return (
              <li
                key={service.title}
                className="rounded-lg border border-border bg-card p-5 text-center transition-colors hover:border-primary/60"
              >
                <Icon
                  className={`mx-auto size-8 ${service.accent}`}
                  strokeWidth={1.6}
                />
                <h3 className="mt-3 text-[13px] font-bold uppercase tracking-[0.08em]">
                  {service.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {service.blurb}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
