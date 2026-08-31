import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import TimelinePageContent from "@/views/pages/timeline/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.timelineTitle,
    description: t.examples.timelineDescription,
  };
}

export default async function TimelinePage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <TimelinePageContent initialTab={tab} initialFull={full === "1"} />;
}
