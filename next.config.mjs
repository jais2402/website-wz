import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: no server, no middleware, no Server Actions. See .claude/architecture.md §5.
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,

  // Turbopack infers the workspace root by walking up for a lockfile, which
  // finds an unrelated package-lock.json in the home directory and would pull
  // it into the project. Pin the root to this folder. Derived from the config's
  // own location so it stays correct on any machine.
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },

  images: {
    // The default loader needs a server. Static export uses unoptimized or a custom loader.
    unoptimized: true,
  },

  // `eslint` is not a valid next.config key in Next 16 — lint is its own step.
  // `pnpm verify` runs `pnpm lint` before the build, so nothing is lost.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
