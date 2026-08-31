// Ported from next-js-boilerplate/src/app/routing/redirect-perm/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Permanent Redirect",
  description: "Redirect demo",
};

export const Route = createFileRoute("/routing/redirect-perm/")({
  head: () => metadataToHead(metadata),
  component: RedirectPermPage,
});

function RedirectPermPage() {
  permanentRedirect("/routing/b");
}
