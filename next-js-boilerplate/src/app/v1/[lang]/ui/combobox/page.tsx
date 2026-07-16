import type { Metadata } from "next";
import PageContent from "@/views/ui/combobox/PageContent";

export const metadata: Metadata = {
  title: "Combobox",
  description: "Combobox component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ComboboxPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
