import type { Metadata } from "next";
import PageContent from "@/views/ui/command/PageContent";

export const metadata: Metadata = {
  title: "Command",
  description: "Command component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CommandPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
