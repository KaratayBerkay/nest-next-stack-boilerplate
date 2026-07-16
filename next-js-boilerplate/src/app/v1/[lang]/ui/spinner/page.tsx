import type { Metadata } from "next";
import PageContent from "@/views/ui/spinner/PageContent";

export const metadata: Metadata = {
  title: "Spinner",
  description: "Spinner component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SpinnerPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
