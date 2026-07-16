import type { Metadata } from "next";
import PageContent from "@/views/ui/radio-group/PageContent";

export const metadata: Metadata = {
  title: "Radio Group",
  description: "Radio Group component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function RadioGroupPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
