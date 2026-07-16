import type { Metadata } from "next";
import PageContent from "@/views/ui/empty/PageContent";

export const metadata: Metadata = {
  title: "Empty",
  description: "Empty component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function EmptyPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
