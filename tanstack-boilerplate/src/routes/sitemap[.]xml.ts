// Ported from next-js-boilerplate/src/app/sitemap.ts — served as an XML
// server route instead of Next's metadata convention.
import { createFileRoute } from "@tanstack/react-router";

const staticRoutes = [
  "/",
  "/about",
  "/pricing",
  "/routing",
  "/routing/a",
  "/routing/b",
  "/routing/boom",
  "/routing/items",
  "/routing/metadata-demo",
  "/routing/missing",
  "/routing/redirect-temp",
  "/routing/redirect-perm",
  "/routing/slow",
  "/dashboard",
  "/gallery",
  "/images",
  "/fonts",
  "/scripts",
  "/lazy-loading",
  "/caching",
  "/client-data",
  "/csr",
  "/csr-cookies",
  "/ssr",
  "/ssr-cookies",
  "/data-fetching",
  "/request-memoization",
  "/server-actions",
  "/static",
  "/dynamic",
  "/ppr",
  "/search-params",
  "/form",
  "/sse",
  "/ws",
  "/observability",
  "/security/csp",
  "/i18n",
  "/v1",
];

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}

function renderXml(entries: Array<SitemapEntry>): string {
  const items = entries
    .map(
      (entry) =>
        `  <url>\n` +
        `    <loc>${entry.url}</loc>\n` +
        `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n` +
        `    <changefreq>${entry.changeFrequency}</changefreq>\n` +
        `    <priority>${entry.priority}</priority>\n` +
        `  </url>`,
    )
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${items}\n` +
    `</urlset>\n`
  );
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [{ clientEnv }, { locales }] = await Promise.all([
          import("@/lib/env"),
          import("@/lib/i18n/config"),
        ]);
        const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

        const staticEntries: Array<SitemapEntry> = staticRoutes.map(
          (route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: route === "/" ? "monthly" : "weekly",
            priority: route === "/" ? 1.0 : 0.8,
          }),
        );

        const localeEntries: Array<SitemapEntry> = locales.flatMap((locale) => [
          {
            url: `${baseUrl}/v1/${locale}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          },
          {
            url: `${baseUrl}/i18n/${locale}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          },
        ]);

        return new Response(renderXml([...staticEntries, ...localeEntries]), {
          headers: { "content-type": "application/xml" },
        });
      },
    },
  },
});
