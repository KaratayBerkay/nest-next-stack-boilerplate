import type { Metadata } from "next";
import PageContent from "@/views/ui/textarea/PageContent";

export const metadata: Metadata = {
  title: "Textarea",
  description: "Textarea component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TextareaPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
