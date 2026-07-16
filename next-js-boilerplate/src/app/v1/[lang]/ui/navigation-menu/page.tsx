import type { Metadata } from "next";
import PageContent from "@/views/ui/navigation-menu/PageContent";

export const metadata: Metadata = {
  title: "Navigation Menu",
  description: "Navigation Menu component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function NavigationMenuPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
