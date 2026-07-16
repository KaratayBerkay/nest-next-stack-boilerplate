import type { Metadata } from "next";
import PageContent from "@/views/ui/checkbox/PageContent";

export const metadata: Metadata = {
  title: "Checkbox",
  description: "Checkbox component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CheckboxPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
