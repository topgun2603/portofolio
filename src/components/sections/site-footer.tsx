import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/icons/brand";
import { profile } from "@/data/portfolio";

const socialIcons = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  mail: Mail,
  whatsapp: WhatsappIcon,
} as const;

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:px-6 lg:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/15 font-mono text-lg font-bold text-primary ring-1 ring-primary/30">
            {profile.initial}
          </span>
          <span className="leading-none">
            <span className="block text-sm font-bold tracking-[0.12em]">
              {profile.name.toUpperCase()}
            </span>
            <span className="mt-0.5 block text-[9px] tracking-[0.22em] text-muted-foreground">
              {profile.motto}
            </span>
          </span>
        </div>

        <ul className="flex items-center gap-6 lg:mx-auto">
          {profile.socials.map((social) => {
            const Icon = socialIcons[social.icon];
            return (
              <li key={social.label}>
                <a
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="size-4" />
                  {social.label}
                </a>
              </li>
            );
          })}
        </ul>

        <p className="text-center text-xs text-muted-foreground lg:text-right">
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
          <span className="mt-1 block">{profile.footerNote}</span>
        </p>
      </div>
    </footer>
  );
}
