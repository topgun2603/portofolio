import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * `next dev` and `next build` both write to `.next`, so running a build while
   * a dev server is up corrupts the running server's state - it starts serving
   * 404s until restarted. Setting NEXT_DIST_DIR sends a verification build
   * somewhere else so the two never collide.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
