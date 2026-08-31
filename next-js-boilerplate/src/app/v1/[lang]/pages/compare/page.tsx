import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ComparePageContent from "@/views/pages/compare/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.compareTitle,
    description: t.examples.compareDescription,
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ComparePageContent initialTab={tab} initialFull={full === "1"} />;
}
