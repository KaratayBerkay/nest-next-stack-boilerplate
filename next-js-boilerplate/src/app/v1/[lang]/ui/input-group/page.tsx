import type { Metadata } from "next";
import PageContent from "@/views/ui/input-group/PageContent";

export const metadata: Metadata = {
  title: "Input Group",
  description: "Input Group component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function InputGroupPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
