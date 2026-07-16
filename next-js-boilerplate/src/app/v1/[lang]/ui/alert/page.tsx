import type { Metadata } from "next";
import PageContent from "@/views/ui/alert/PageContent";

export const metadata: Metadata = {
  title: "Alert",
  description: "Alert component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AlertPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
