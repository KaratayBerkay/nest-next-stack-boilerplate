const HOSTNAMES = (
  process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES ?? "picsum.photos,localhost"
)
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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' blob: data: https:; " +
            "font-src 'self' data:; " +
            "connect-src 'self' ws: wss: https: https://*.stripe.com; " +
            "frame-src 'self' https://*.stripe.com; " +
            "object-src 'none'; " +
            "base-uri 'self'; " +
            "frame-ancestors 'none'; " +
            "upgrade-insecure-requests",
        },
      ],
    },
    {
      // Served files are embedded in a same-origin <iframe> for PDF preview
      // (AttachmentPreview); the blanket DENY/'none' above would block the
      // resource from framing itself.
      source: "/api/upload/serve",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        {
          key: "Content-Security-Policy",
          value: "default-src 'none'; frame-ancestors 'self';",
        },
      ],
    },
    {
      // The blanket camera=()/microphone=() above blocks getUserMedia()
      // everywhere, including here — RTC (calls/meetings/streaming) needs
      // both, plus display-capture for meeting screen-share.
      source: "/v1/:lang/rtc/:path*",
      headers: [
        {
          key: "Permissions-Policy",
          value: "camera=(self), microphone=(self), display-capture=(self)",
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
