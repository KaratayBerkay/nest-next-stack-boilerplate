// Ported from next-js-boilerplate/src/app/(demos)/theme/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import ThemePageContent from "@/views/demos/theme/PageContent";

export const metadata: Metadata = {
  title: "Theme",
  description: "Theme switching demo",
};

export const Route = createFileRoute("/_demos/theme/")({
  head: () => metadataToHead(metadata),
  component: ThemePage,
});

function ThemePage() {
  return <ThemePageContent />;
}
