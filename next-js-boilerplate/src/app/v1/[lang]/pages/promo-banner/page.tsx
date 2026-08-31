import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PromoBannerPageContent from "@/views/pages/promo-banner/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.promoBannerTitle,
    description: t.examples.promoBannerDescription,
  };
}

export default async function PromoBannerPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <PromoBannerPageContent initialTab={tab} initialFull={full === "1"} />;
}
