import type { Metadata } from "next";
import PageContent from "@/views/ui/toast/PageContent";

export const metadata: Metadata = {
  title: "Toast",
  description: "Toast component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ToastPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
