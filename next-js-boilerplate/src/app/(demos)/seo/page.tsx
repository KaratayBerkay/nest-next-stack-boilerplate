import type { Metadata } from "next";
import { JsonLd } from "@/lib/seo/JsonLd";

export const metadata: Metadata = {
  title: "SEO",
  description: "Structured data with JSON-LD, sitemap, and robots.txt.",
  openGraph: {
    title: "SEO — Next.js Boilerplate",
    description: "SEO features including JSON-LD structured data.",
  },
};

export default function SeoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">SEO Features</h2>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          JSON-LD Structured Data
        </h3>
        <p className="text-muted text-sm">
          This page embeds a BreadcrumbList schema via the shared{" "}
          <code>JsonLd</code> component. A WebSite schema is rendered in the
          root layout. Every page also exports metadata (title, description, OG
          tags).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Sitemap
        </h3>
        <p className="text-muted text-sm">
          A dynamic <code>sitemap.ts</code> at <code>/sitemap.xml</code> lists
          all static routes plus versioned locale pages.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Robots
        </h3>
        <p className="text-muted text-sm">
          A <code>robots.ts</code> at <code>/robots.txt</code> allows all
          crawling and points to the sitemap.
        </p>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "SEO",
              item: "/seo",
            },
          ],
        }}
      />
    </div>
  );
}
