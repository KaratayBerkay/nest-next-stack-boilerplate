import type { Metadata } from "next";
import PageContent from "@/views/ui/time-input/PageContent";

export const metadata: Metadata = {
  title: "Time Input",
  description: "Time input component with dropdown selectors and timezone support",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TimeInputPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
