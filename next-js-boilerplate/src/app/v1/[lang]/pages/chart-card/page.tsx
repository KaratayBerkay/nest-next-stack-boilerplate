import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ChartCardPageContent from "@/views/pages/chart-card/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.chartCardTitle,
    description: t.examples.chartCardDescription,
  };
}

export default async function ChartCardPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ChartCardPageContent initialTab={tab} initialFull={full === "1"} />;
}
