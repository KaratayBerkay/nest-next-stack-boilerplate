import type { Metadata } from "next";
import PageContent from "@/views/ui/progress/PageContent";

export const metadata: Metadata = {
  title: "Progress",
  description: "Progress component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProgressPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
