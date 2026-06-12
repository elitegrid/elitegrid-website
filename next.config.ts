import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — stray lockfiles in parent dirs otherwise make
  // Next infer the wrong root, which can break output file tracing on deploy.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
