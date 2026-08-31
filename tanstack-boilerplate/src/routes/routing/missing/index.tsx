// Ported from next-js-boilerplate/src/app/routing/missing/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Missing",
  description: "Not found demo",
};

export const Route = createFileRoute("/routing/missing/")({
  head: () => metadataToHead(metadata),
  component: MissingPage,
});

function MissingPage() {
  return notFound();
}
