import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Monorepo: Next was picking the repo root (outer package-lock.json), which can
  // break Turbopack writes under frontend/.next on Windows (ENOENT on *.tmp files).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
