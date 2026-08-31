import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import HeroPageContent from "@/views/pages/hero/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.heroTitle,
    description: t.examples.heroDescription,
  };
}

export default async function HeroPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <HeroPageContent initialTab={tab} initialFull={full === "1"} />;
}
