// Converts Next.js-style `Metadata` objects (still exported by the ported
// page modules for familiarity) into TanStack Router `head()` results.
// The root route provides the base tags; per-route heads emitted from
// `metadataToHead` override title/description/OG on top of them.

import type { Metadata, Viewport } from "next";

export const SITE_NAME = "TanStack Boilerplate";
const TITLE_TEMPLATE = `%s — ${SITE_NAME}`;

type HeadMeta = Record<string, string | undefined>;

interface HeadResult {
  meta: Array<HeadMeta>;
  links: Array<Record<string, string>>;
}

export function resolveTitle(title: Metadata["title"]): string | undefined {
  if (title === null || title === undefined) return undefined;
  if (typeof title === "string") return TITLE_TEMPLATE.replace("%s", title);
  if (title.absolute) return title.absolute;
  if (title.default) return title.default;
  return undefined;
}

function pushMeta(
  meta: Array<HeadMeta>,
  key: "name" | "property",
  id: string,
  content: string | number | undefined | null,
): void {
  if (content === undefined || content === null || content === "") return;
  meta.push({ [key]: id, content: String(content) });
}

function firstImage(
  images:
    | undefined
    | null
    | string
    | URL
    | { url: string | URL }
    | Array<string | URL | { url: string | URL }>,
): string | undefined {
  if (!images) return undefined;
  const first = Array.isArray(images) ? images[0] : images;
  if (!first) return undefined;
  if (typeof first === "string") return first;
  if (first instanceof URL) return first.toString();
  return first.url.toString();
}

export function metadataToHead(
  metadata: Metadata = {},
  viewport?: Viewport,
): HeadResult {
  const meta: Array<HeadMeta> = [];
  const links: Array<Record<string, string>> = [];

  const title = resolveTitle(metadata.title);
  if (title) meta.push({ title });

  pushMeta(meta, "name", "description", metadata.description ?? undefined);

  if (metadata.keywords) {
    pushMeta(
      meta,
      "name",
      "keywords",
      Array.isArray(metadata.keywords)
        ? metadata.keywords.join(", ")
        : metadata.keywords,
    );
  }

  if (typeof metadata.robots === "string") {
    pushMeta(meta, "name", "robots", metadata.robots);
  } else if (metadata.robots && typeof metadata.robots === "object") {
    const directives: Array<string> = [];
    if (metadata.robots.index === false) directives.push("noindex");
    else if (metadata.robots.index) directives.push("index");
    if (metadata.robots.follow === false) directives.push("nofollow");
    else if (metadata.robots.follow) directives.push("follow");
    if (metadata.robots.nocache) directives.push("nocache");
    if (directives.length)
      pushMeta(meta, "name", "robots", directives.join(", "));
  }

  const og = metadata.openGraph;
  if (og) {
    pushMeta(
      meta,
      "property",
      "og:title",
      typeof og.title === "string" ? og.title : (title ?? undefined),
    );
    pushMeta(meta, "property", "og:description", og.description);
    pushMeta(meta, "property", "og:site_name", og.siteName ?? SITE_NAME);
    pushMeta(meta, "property", "og:type", og.type ?? "website");
    if (og.url) pushMeta(meta, "property", "og:url", og.url.toString());
    if (og.locale) pushMeta(meta, "property", "og:locale", og.locale);
    pushMeta(
      meta,
      "property",
      "og:image",
      firstImage(og.images as Parameters<typeof firstImage>[0]),
    );
  }

  const twitter = metadata.twitter;
  if (twitter) {
    pushMeta(meta, "name", "twitter:card", twitter.card ?? "summary");
    pushMeta(meta, "name", "twitter:site", twitter.site);
    pushMeta(meta, "name", "twitter:creator", twitter.creator);
    pushMeta(
      meta,
      "name",
      "twitter:title",
      typeof twitter.title === "string" ? twitter.title : undefined,
    );
    pushMeta(meta, "name", "twitter:description", twitter.description);
    pushMeta(
      meta,
      "name",
      "twitter:image",
      firstImage(twitter.images as Parameters<typeof firstImage>[0]),
    );
  }

  const canonical = metadata.alternates?.canonical;
  if (canonical) {
    links.push({ rel: "canonical", href: canonical.toString() });
  }
  const languages = metadata.alternates?.languages;
  if (languages) {
    for (const [hrefLang, href] of Object.entries(languages)) {
      if (href) {
        links.push({ rel: "alternate", hrefLang, href: href.toString() });
      }
    }
  }

  if (viewport?.themeColor && typeof viewport.themeColor === "string") {
    pushMeta(meta, "name", "theme-color", viewport.themeColor);
  }

  return { meta, links };
}
