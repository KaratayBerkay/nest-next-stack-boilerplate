import type { Metadata } from "next";
import PageContent from "@/views/ui/popover/PageContent";

export const metadata: Metadata = {
  title: "Popover",
  description: "Popover component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function PopoverPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
