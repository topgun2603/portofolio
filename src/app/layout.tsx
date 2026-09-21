import type { Metadata, Viewport } from "next";
import { Caveat, Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ExperienceProvider } from "@/components/experience/experience-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { profile } from "@/data/portfolio";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// The console skin is monospace top to bottom; JetBrains Mono is the look.
const jetbrains = JetBrains_Mono({ variable: "--font-terminal", subsets: ["latin"] });
// The chalked wall and the "work from anywhere" note are handwriting, not type.
const caveat = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: `${profile.name} - ${profile.role}`,
  description: profile.intro,
};

export const viewport: Viewport = {
  themeColor: "#05070b",
};

/**
 * Decides light or dark before first paint, so a returning visitor who already
 * skipped the intro never sees a flash of darkness. React adopts whatever this
 * sets; it owns `data-mode` from hydration onward.
 */
const NO_FLASH = `
(function(){
  try {
    // The console skin is picked before first paint too, so a visitor who chose
    // it last time never sees the product site flash first.
    // ?skin=terminal opens straight into the console, so it can be linked to
    // and screenshotted without going through the toggle first.
    var wants = /[?&]skin=(terminal|product)/.exec(location.search);
    var skin = (wants ? wants[1] : localStorage.getItem('flashlight-portfolio:skin'))
      === 'terminal' ? 'terminal' : 'product';
    document.documentElement.dataset.skin = skin;

    // The accent, before first paint for the same reason as the skin. ?accent=
    // wins over the stored choice, which makes a theme shareable and testable
    // without clearing storage - the same trick ?intro plays below.
    // Checked against the known list: this value ends up in an attribute that
    // CSS selects on, and an unvetted query string has no business there.
    var themes = ['crimson', 'amber', 'emerald', 'azure', 'violet', 'rainbow'];
    var asked = /[?&]accent=([a-z]+)/.exec(location.search);
    var accent = asked ? asked[1] : localStorage.getItem('flashlight-portfolio:accent');
    if (themes.indexOf(accent) > 0) document.documentElement.dataset.accent = accent;

    // The torch only lives on the product home page; everything else is lit.
    if (location.pathname !== '/' || skin === 'terminal') {
      document.documentElement.dataset.mode = 'lit';
      return;
    }
    // ?intro forces the dark opening even for a visitor who already skipped it,
    // which makes the experience shareable and testable without clearing storage.
    var forced = /[?&]intro\\b/.test(location.search) || location.hash === '#intro';
    var lit = localStorage.getItem('flashlight-portfolio:lit') === '1';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.dataset.mode =
      forced ? 'intro' : (lit || reduced) ? 'lit' : 'intro';
  } catch (e) {
    document.documentElement.dataset.mode = 'intro';
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${jetbrains.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ExperienceProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ExperienceProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
