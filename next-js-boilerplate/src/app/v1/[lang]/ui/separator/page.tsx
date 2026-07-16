import type { Metadata } from "next";
import PageContent from "@/views/ui/separator/PageContent";

export const metadata: Metadata = {
  title: "Separator",
  description: "Separator component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SeparatorPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
