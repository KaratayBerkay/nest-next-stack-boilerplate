// Compat shim for the bare `next` module — type-only surface.
// The codebase imports `Metadata`, `Viewport`, and `MetadataRoute` from
// "next" for page metadata. Under TanStack Start these objects are consumed
// by the route generator (`scripts/`-era pages) and by `metadataToHead` in
// `src/lib/head.ts`, which converts them into TanStack `head()` results.

type TemplateString =
  string | { default?: string; template?: string; absolute?: string };

interface OpenGraphImage {
  url: string | URL;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface Metadata {
  metadataBase?: URL | null;
  title?: TemplateString | null;
  description?: string | null;
  applicationName?: string | null;
  keywords?: string | Array<string> | null;
  authors?:
    | { name?: string; url?: string | URL }
    | Array<{ name?: string; url?: string | URL }>
    | null;
  creator?: string | null;
  publisher?: string | null;
  manifest?: string | URL | null;
  robots?:
    | string
    | {
        index?: boolean;
        follow?: boolean;
        nocache?: boolean;
        googleBot?: string | Record<string, boolean | string | number>;
        [key: string]: unknown;
      }
    | null;
  alternates?: {
    canonical?: string | URL | null;
    languages?: Record<string, string | URL | null> | null;
    [key: string]: unknown;
  } | null;
  icons?: unknown;
  openGraph?: {
    title?: TemplateString | null;
    description?: string;
    url?: string | URL;
    siteName?: string;
    images?:
      string | URL | OpenGraphImage | Array<string | URL | OpenGraphImage>;
    locale?: string;
    type?: string;
    [key: string]: unknown;
  } | null;
  twitter?: {
    card?: "summary" | "summary_large_image" | "player" | "app";
    site?: string;
    creator?: string;
    title?: TemplateString | null;
    description?: string;
    images?: string | URL | Array<string | URL>;
    [key: string]: unknown;
  } | null;
  verification?: Record<string, unknown> | null;
  category?: string | null;
  other?: Record<string, string | number | Array<string | number>>;
  [key: string]: unknown;
}

export interface Viewport {
  width?: string | number;
  height?: string | number;
  initialScale?: number;
  minimumScale?: number;
  maximumScale?: number;
  userScalable?: boolean;
  viewportFit?: "auto" | "cover" | "contain";
  interactiveWidget?: "resizes-visual" | "resizes-content" | "overlays-content";
  themeColor?: string | Array<{ media?: string; color: string }> | null;
  colorScheme?:
    | "normal"
    | "light"
    | "dark"
    | "light dark"
    | "dark light"
    | "only light"
    | null;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MetadataRoute {
  export type Robots = {
    rules:
      | {
          userAgent?: string | Array<string>;
          allow?: string | Array<string>;
          disallow?: string | Array<string>;
          crawlDelay?: number;
        }
      | Array<{
          userAgent: string | Array<string>;
          allow?: string | Array<string>;
          disallow?: string | Array<string>;
          crawlDelay?: number;
        }>;
    sitemap?: string | Array<string>;
    host?: string;
  };

  export type Sitemap = Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?:
      "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
    alternates?: { languages?: Record<string, string> };
  }>;

  export type Manifest = Record<string, unknown>;
}

export type ResolvingMetadata = Metadata;
export type ResolvingViewport = Viewport;

export type NextPage<P = object, IP = P> = React.ComponentType<P> & {
  getInitialProps?: (ctx: unknown) => IP | Promise<IP>;
};

export interface NextConfig {
  [key: string]: unknown;
}
