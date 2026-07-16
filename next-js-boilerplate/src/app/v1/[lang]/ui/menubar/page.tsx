import type { Metadata } from "next";
import PageContent from "@/views/ui/menubar/PageContent";

export const metadata: Metadata = {
  title: "Menubar",
  description: "Menubar component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MenubarPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
