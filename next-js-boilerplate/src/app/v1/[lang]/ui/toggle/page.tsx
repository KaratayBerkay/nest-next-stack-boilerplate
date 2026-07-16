import type { Metadata } from "next";
import PageContent from "@/views/ui/toggle/PageContent";

export const metadata: Metadata = {
  title: "Toggle",
  description: "Toggle component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TogglePage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
