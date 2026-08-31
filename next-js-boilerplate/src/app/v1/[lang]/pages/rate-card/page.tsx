import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import RateCardPageContent from "@/views/pages/rate-card/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.rateCardTitle,
    description: t.examples.rateCardDescription,
  };
}

export default async function RateCardPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <RateCardPageContent initialTab={tab} initialFull={full === "1"} />;
}
