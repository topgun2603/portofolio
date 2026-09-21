import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/portfolio";

export const metadata: Metadata = {
  title: `Blog - ${profile.name}`,
  description: "Notes on building products.",
};

/**
 * A real route so the Blog link in the nav is never dead. Replace the body with
 * a post list when you have posts; the header deliberately stays out of the way
 * here because the torch experience only applies to the home page.
 */
export default function BlogPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-24 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
        Blog
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Notes are on the way.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        I&apos;m writing up what I learn shipping products — architecture
        decisions, working with AI tools, and the things that only show up in
        production.
      </p>
      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to the portfolio
          </Link>
        </Button>
      </div>
    </main>
  );
}
