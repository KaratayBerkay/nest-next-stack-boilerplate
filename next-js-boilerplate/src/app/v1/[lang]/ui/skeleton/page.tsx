import type { Metadata } from "next";
import PageContent from "@/views/ui/skeleton/PageContent";

export const metadata: Metadata = {
  title: "Skeleton",
  description: "Skeleton component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SkeletonPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
