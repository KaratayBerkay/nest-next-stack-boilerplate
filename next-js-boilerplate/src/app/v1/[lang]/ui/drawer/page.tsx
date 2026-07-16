import type { Metadata } from "next";
import PageContent from "@/views/ui/drawer/PageContent";

export const metadata: Metadata = {
  title: "Drawer",
  description: "Drawer component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DrawerPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
