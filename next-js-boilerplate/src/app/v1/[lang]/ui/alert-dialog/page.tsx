import type { Metadata } from "next";
import PageContent from "@/views/ui/alert-dialog/PageContent";

export const metadata: Metadata = {
  title: "Alert Dialog",
  description: "Alert Dialog component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AlertDialogPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
