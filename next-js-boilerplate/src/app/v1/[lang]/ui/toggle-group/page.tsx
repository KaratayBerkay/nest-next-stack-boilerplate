import type { Metadata } from "next";
import PageContent from "@/views/ui/toggle-group/PageContent";

export const metadata: Metadata = {
  title: "Toggle Group",
  description: "Toggle Group component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ToggleGroupPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
