import { ArrowRight, Clock, Download, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/icons/brand";
import { locations, profile } from "@/data/portfolio";

const socialIcons = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  mail: Mail,
  whatsapp: WhatsappIcon,
} as const;

export function CallToAction() {
  return (
    <div className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_auto_1fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
            Let&apos;s Build Something
            <br />
            <span className="text-primary">Amazing Together!</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            I build web applications and SaaS products end to end - from the data
            model to the interface. Open to freelance work and full-time roles.
          </p>

          <ul className="mt-6 flex items-center gap-3">
            {profile.socials.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="grid size-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="h-14 px-8 text-base font-bold">
            <a href={`mailto:${profile.email}`}>
              Get In Touch
              <ArrowRight className="size-5" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8">
            <a href={profile.resumeUrl} download>
              <Download className="size-4" />
              Download CV
            </a>
          </Button>
        </div>

        <ul className="space-y-4 text-sm lg:justify-self-end">
          <li className="flex items-center gap-3">
            <Mail className="size-5 shrink-0 text-primary" />
            <a href={`mailto:${profile.email}`} className="hover:text-primary">
              {profile.email}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <WhatsappIcon className="size-5 shrink-0 text-primary" />
            <a
              href={profile.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-primary"
            >
              {profile.phone}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="size-5 shrink-0 text-primary" />
            {locations.join("  •  ")}
          </li>
          <li className="flex items-center gap-3">
            <Clock className="size-5 shrink-0 text-primary" />
            Available for freelance projects
          </li>
        </ul>
      </div>
    </div>
  );
}
