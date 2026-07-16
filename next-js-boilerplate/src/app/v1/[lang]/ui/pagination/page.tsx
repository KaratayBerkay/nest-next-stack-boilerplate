import type { Metadata } from "next";
import PageContent from "@/views/ui/pagination/PageContent";

export const metadata: Metadata = {
  title: "Pagination",
  description: "Pagination component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function PaginationPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
