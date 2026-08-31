// Ported from next-js-boilerplate/src/app/gallery/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { GalleryList } from "./-gallery-list";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse the gallery",
};

export const Route = createFileRoute("/gallery/")({
  head: () => metadataToHead(metadata),
  component: GalleryList,
});
