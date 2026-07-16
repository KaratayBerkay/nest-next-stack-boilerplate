import type { Metadata } from "next";
import PageContent from "@/views/ui/select/PageContent";

export const metadata: Metadata = {
  title: "Select",
  description: "Select component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SelectPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
