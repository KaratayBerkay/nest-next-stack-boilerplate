import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/pages/background-pattern/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.backgroundPatternTitle,
    description: t.examples.backgroundPatternDescription,
  };
}

export default async function BackgroundPatternPage({
  searchParams,
}: PageProps) {
  const { tab, full } = await searchParams;
  return <PageContent initialTab={tab} initialFull={full === "1"} />;
}
