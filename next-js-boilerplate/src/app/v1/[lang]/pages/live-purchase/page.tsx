import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import LivePurchasePageContent from "@/views/pages/live-purchase/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.livePurchaseTitle,
    description: t.examples.livePurchaseDescription,
  };
}

export default async function LivePurchasePage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <LivePurchasePageContent initialTab={tab} initialFull={full === "1"} />
  );
}
