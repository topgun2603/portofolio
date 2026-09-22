import Image from "next/image";
import {
  ArrowRight,
  Download,
  Gauge,
  Globe,
  Layers,
  Play,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroHighlights, locations, profile } from "@/data/portfolio";

const highlightIcons: Record<string, LucideIcon> = {
  stack: Layers,
  gauge: Gauge,
  phone: Smartphone,
  sparkles: Sparkles,
};

export function Hero() {
  const [first, ...rest] = profile.fullName.split(" ");
  const [roleLead, roleAccent] = profile.roleLines;

  return (
    <div className="relative overflow-hidden border-b border-border/60">
      {/*
        The oversized wordmark, cropped by the top edge. Purely decorative and
        aria-hidden - the real heading is the h1 below.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-0 right-0 select-none text-center text-[19vw] font-black leading-[0.75] tracking-tighter text-primary/[0.13] sm:-top-10"
      >
        PORTFOLIO
      </span>

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-24 sm:px-6 lg:grid-cols-[1fr_0.95fr_auto] lg:items-center lg:gap-8 lg:pt-28">
        <div>
          <p className="font-hand text-3xl text-primary sm:text-4xl">Hello, I&apos;m</p>

          <h1 className="mt-1 text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block">{first}</span>
            <span className="block text-primary">{rest.join(" ")}</span>
          </h1>

          <p className="mt-4 text-lg font-bold uppercase tracking-wide sm:text-xl">
            {roleLead} &amp;
            <br />
            <span className="text-primary">{roleAccent}</span>
          </p>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {profile.intro}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="font-semibold">
              <a href="#work">
                View My Work
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#about">
                <Play className="size-4" />
                About Me
              </a>
            </Button>
            {/*
              `download` rather than a plain link: the label says Download, and a
              PDF that opens in a tab instead leaves the visitor to work out how
              to keep it.
            */}
            <Button asChild size="lg" variant="outline">
              <a href={profile.resumeUrl} download>
                <Download className="size-4" />
                Download CV
              </a>
            </Button>
          </div>

          <p className="mt-7 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-border bg-card/70 px-4 py-2 text-xs">
            <Globe className="size-4 shrink-0 text-primary" />
            {locations.map((place, i) => (
              <span key={place} className="flex items-center gap-3">
                {i > 0 && <span className="text-primary">&bull;</span>}
                {place}
              </span>
            ))}
          </p>
        </div>

        <Portrait />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {heroHighlights.map((item) => {
            const Icon = highlightIcons[item.icon];
            return (
              <li key={item.title.join(" ")} className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-primary">
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em]">
                  {item.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * The cut-out photograph, graded into the skin's red rather than dropped in as
 * a neutral headshot. `gowtham-v2.png` already carries an alpha channel, so
 * there is no rectangle to hide.
 */
function Portrait() {
  return (
    <div className="relative mx-auto flex w-full max-w-sm items-end justify-center lg:max-w-none">
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -z-10 h-[86%] w-[86%] -translate-x-1/2 rounded-[46%] blur-3xl"
        style={{ background: "color-mix(in oklab, var(--primary) 34%, transparent)" }}
      />
      <Image
        src="/gowtham-v2.png"
        alt=""
        aria-hidden="true"
        width={822}
        height={1476}
        priority
        sizes="(max-width: 1024px) 70vw, 34vw"
        className="relative h-auto w-full max-w-[22rem] object-contain lg:max-w-none"
        style={{
          filter:
            "contrast(1.14) saturate(0.78) brightness(0.95) drop-shadow(0 18px 40px rgba(0,0,0,0.6))",
        }}
      />
    </div>
  );
}
