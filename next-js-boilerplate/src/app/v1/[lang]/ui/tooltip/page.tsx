import type { Metadata } from "next";
import PageContent from "@/views/ui/tooltip/PageContent";

export const metadata: Metadata = {
  title: "Tooltip",
  description: "Tooltip component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TooltipPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
