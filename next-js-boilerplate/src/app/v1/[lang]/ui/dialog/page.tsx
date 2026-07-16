import type { Metadata } from "next";
import PageContent from "@/views/ui/dialog/PageContent";

export const metadata: Metadata = {
  title: "Dialog",
  description: "Dialog component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DialogPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
