import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import StatsPageContent from "@/views/pages/stats/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.statsTitle,
    description: t.examples.statsDescription,
  };
}

export default async function StatsPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <StatsPageContent initialTab={tab} initialFull={full === "1"} />;
}
