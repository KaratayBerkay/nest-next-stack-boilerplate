import type { Metadata } from "next";
import PageContent from "@/views/ui/switch/PageContent";

export const metadata: Metadata = {
  title: "Switch",
  description: "Switch component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SwitchPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
