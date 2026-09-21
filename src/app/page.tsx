"use client";

import { useSyncExternalStore } from "react";
import { getServerSkin, getSkin, subscribeSkin } from "@/lib/skin-store";
import { Discoverable } from "@/components/experience/discoverable";
import { TorchExperience } from "@/components/experience/torch-experience";
import { Fireworks } from "@/components/experience/fireworks";
import { TerminalPortfolio } from "@/components/terminal/terminal-portfolio";
import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { AboutAndServices } from "@/components/sections/about-services";
import { WorkCollection, TechStrip } from "@/components/sections/work-collection";
import { CallToAction } from "@/components/sections/call-to-action";
import { SiteFooter } from "@/components/sections/site-footer";

/**
 * Two portfolios, one page. The skin lives on <html>, set before first paint,
 * so a visitor who chose the console last time never sees the product site
 * flash first.
 *
 * Either way the content is rendered in full from the first byte - the torch
 * layer is the only thing that hides it, which keeps the site crawlable and one
 * `skipIntro()` away from being ordinary.
 */
export default function Home() {
  const skin = useSyncExternalStore(subscribeSkin, getSkin, getServerSkin);

  if (skin === "terminal") return <TerminalPortfolio />;

  return (
    <>
      {/* Covers the page until the beam canvas mounts; see globals.css. */}
      <div className="intro-blackout" aria-hidden="true" />

      <SiteHeader />

      <main className="flex-1">
        <Discoverable id="hero">
          <Hero />
        </Discoverable>

        <Discoverable id="about">
          <AboutAndServices />
        </Discoverable>

        <TechStrip />

        <Discoverable id="work">
          <WorkCollection />
        </Discoverable>

        <Discoverable id="contact">
          <CallToAction />
        </Discoverable>
      </main>

      <SiteFooter />
      <TorchExperience />
      {/*
        Outside <TorchExperience> deliberately: that layer unmounts the moment
        the mode reaches "lit", which is about when the first shell bursts.
      */}
      <Fireworks />
    </>
  );
}
