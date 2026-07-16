import type { Metadata } from "next";
import PageContent from "@/views/ui/card/PageContent";

export const metadata: Metadata = {
  title: "Card",
  description: "Card component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CardPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
