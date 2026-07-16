import type { Metadata } from "next";
import PageContent from "@/views/ui/confirm-dialog/PageContent";

export const metadata: Metadata = {
  title: "Confirm Dialog",
  description: "Confirm Dialog component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ConfirmDialogPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
