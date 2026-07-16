import type { Metadata } from "next";
import PageContent from "@/views/ui/counter/PageContent";

export const metadata: Metadata = {
  title: "Counter",
  description: "Counter component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CounterPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
