import type { MetadataRoute } from "next";
import { clientEnv } from "@/lib/env";
import { locales } from "@/lib/i18n/config";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "monthly" : "weekly",
    priority: route === "/" ? 1.0 : 0.8,
  }));

  const localeEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
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

  return [...staticEntries, ...localeEntries];
}
