// Ported from next-js-boilerplate/src/app/routing/redirect-temp/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Temporary Redirect",
  description: "Redirect demo",
};

export const Route = createFileRoute("/routing/redirect-temp/")({
  head: () => metadataToHead(metadata),
  component: RedirectTempPage,
});

function RedirectTempPage() {
  redirect("/routing/a");
}
