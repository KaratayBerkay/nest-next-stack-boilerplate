import type { Metadata } from "next";
import PageContent from "@/views/ui/button/PageContent";

export const metadata: Metadata = {
  title: "Button",
  description: "Button component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ButtonPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
