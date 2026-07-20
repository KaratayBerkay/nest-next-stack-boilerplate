const HOSTNAMES = (process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES ?? "picsum.photos,localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  poweredByHeader: false,

  experimental: {
    hideLogsAfterAbort: true,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' blob: data: https:; " +
            "font-src 'self' data:; " +
            "connect-src 'self' ws: wss: https:; " +
            "object-src 'none'; " +
            "base-uri 'self'; " +
            "frame-ancestors 'none'; " +
            "upgrade-insecure-requests",
        },
      ],
    },
  ],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: HOSTNAMES.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};


export default (() => {
  if (process.env.ANALYZE === "true") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const withBundleAnalyzer = require("@next/bundle-analyzer").default;
    return withBundleAnalyzer({ enabled: true })(nextConfig);
  }
  return nextConfig;
})();
