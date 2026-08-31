// Ported from next-js-boilerplate/src/app/robots.ts — served as a plain
// text server route instead of Next's metadata convention.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { clientEnv } = await import("@/lib/env");
        const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
        const body = [
          "User-Agent: *",
          "Allow: /",
          "Disallow: /api/",
          "",
          `Sitemap: ${baseUrl}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: { "content-type": "text/plain" },
        });
      },
    },
  },
});
