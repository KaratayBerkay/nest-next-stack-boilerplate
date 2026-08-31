import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import OrderSummaryPageContent from "@/views/pages/order-summary/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.orderSummaryTitle,
    description: t.examples.orderSummaryDescription,
  };
}

export default async function OrderSummaryPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <OrderSummaryPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
