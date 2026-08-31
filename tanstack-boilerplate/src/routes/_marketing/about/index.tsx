// Ported from next-js-boilerplate/src/app/(marketing)/about/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "About",
  description: "About us",
};

export const Route = createFileRoute("/_marketing/about/")({
  head: () => metadataToHead(metadata),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1
        data-testid="page-heading"
        className="text-2xl font-semibold tracking-tight"
      >
        About
      </h1>
      <p className="text-muted text-sm">
        Served at <code>/about</code> — the <code>(marketing)</code> group
        prefix is absent from the URL.
      </p>
    </div>
  );
}
