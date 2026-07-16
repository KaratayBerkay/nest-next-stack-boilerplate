import type { Metadata } from "next";
import PageContent from "@/views/ui/calendar/PageContent";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Calendar component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
