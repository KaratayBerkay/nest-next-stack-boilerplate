import type { Metadata } from "next";
import PageContent from "@/views/ui/date-picker/PageContent";

export const metadata: Metadata = {
  title: "Date Picker",
  description: "Date Picker component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DatePickerPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
