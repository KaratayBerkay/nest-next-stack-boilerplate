import type { Metadata } from "next";
import PageContent from "@/views/ui/kbd/PageContent";

export const metadata: Metadata = {
  title: "Kbd",
  description: "Kbd component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function KbdPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
