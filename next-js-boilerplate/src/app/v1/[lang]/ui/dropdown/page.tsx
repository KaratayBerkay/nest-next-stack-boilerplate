import type { Metadata } from "next";
import PageContent from "@/views/ui/dropdown/PageContent";

export const metadata: Metadata = {
  title: "Dropdown",
  description: "Dropdown component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DropdownPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
