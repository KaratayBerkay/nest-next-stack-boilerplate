import type { Metadata } from "next";
import PageContent from "@/views/ui/error-boundary/PageContent";

export const metadata: Metadata = {
  title: "Error Boundary",
  description: "Error Boundary component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ErrorBoundaryPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
