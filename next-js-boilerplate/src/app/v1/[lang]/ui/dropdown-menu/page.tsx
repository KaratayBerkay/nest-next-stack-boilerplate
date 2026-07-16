import type { Metadata } from "next";
import PageContent from "@/views/ui/dropdown-menu/PageContent";

export const metadata: Metadata = {
  title: "Dropdown Menu",
  description: "Dropdown Menu component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DropdownMenuPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
