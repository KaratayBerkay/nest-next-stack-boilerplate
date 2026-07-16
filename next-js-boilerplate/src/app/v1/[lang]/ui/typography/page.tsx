import type { Metadata } from "next";
import PageContent from "@/views/ui/typography/PageContent";

export const metadata: Metadata = {
  title: "Typography",
  description: "Typography component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TypographyPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
