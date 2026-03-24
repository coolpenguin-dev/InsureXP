import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Hide the bottom-left dev route indicator (N toast) in development.
  devIndicators: false,
  // Monorepo: Next was picking the repo root (outer package-lock.json), which can
  // break Turbopack writes under frontend/.next on Windows (ENOENT on *.tmp files).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
