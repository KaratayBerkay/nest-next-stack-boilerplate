import type { Metadata } from "next";
import PageContent from "@/views/ui/hover-card/PageContent";

export const metadata: Metadata = {
  title: "Hover Card",
  description: "Hover Card component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function HoverCardPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
