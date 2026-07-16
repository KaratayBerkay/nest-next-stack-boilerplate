import type { Metadata } from "next";
import PageContent from "@/views/ui/aspect-ratio/PageContent";

export const metadata: Metadata = {
  title: "Aspect Ratio",
  description: "Aspect Ratio component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AspectRatioPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
