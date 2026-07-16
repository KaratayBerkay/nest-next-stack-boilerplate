import type { Metadata } from "next";
import PageContent from "@/views/ui/breadcrumb/PageContent";

export const metadata: Metadata = {
  title: "Breadcrumb",
  description: "Breadcrumb component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function BreadcrumbPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
