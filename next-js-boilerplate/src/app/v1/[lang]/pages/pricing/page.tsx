import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PricingPageContent from "@/views/pages/pricing/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.pricingTitle,
    description: t.examples.pricingDescription,
  };
}

export default async function PricingPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <PricingPageContent initialTab={tab} initialFull={full === "1"} />;
}
