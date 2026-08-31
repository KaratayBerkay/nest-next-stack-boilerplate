import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CtaPageContent from "@/views/pages/cta/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.ctaTitle,
    description: t.examples.ctaDescription,
  };
}

export default async function CtaPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <CtaPageContent initialTab={tab} initialFull={full === "1"} />;
}
