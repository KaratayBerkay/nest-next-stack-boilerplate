import type { Metadata } from "next";
import PageContent from "@/views/ui/sheet/PageContent";

export const metadata: Metadata = {
  title: "Sheet",
  description: "Sheet component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SheetPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
