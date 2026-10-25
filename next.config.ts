import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — stray lockfiles in parent dirs otherwise make
  // Next infer the wrong root, which can break output file tracing on deploy.
  turbopack: {
    root: __dirname,
  },
  // PostHog behind a first-party path. The audience here is developers, and
  // ad blockers block posthog.com by hostname — without this the data is
  // missing exactly the visitors the site is for.
  async rewrites() {
    return [
      { source: '/ingest/static/:path*', destination: 'https://eu-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/:path*', destination: 'https://eu.i.posthog.com/:path*' },
    ]
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
