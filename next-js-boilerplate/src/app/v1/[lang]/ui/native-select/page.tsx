import type { Metadata } from "next";
import PageContent from "@/views/ui/native-select/PageContent";

export const metadata: Metadata = {
  title: "Native Select",
  description: "Native Select component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function NativeSelectPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
