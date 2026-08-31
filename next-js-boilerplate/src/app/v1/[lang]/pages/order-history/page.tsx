import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import OrderHistoryPageContent from "@/views/pages/order-history/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.orderHistoryTitle,
    description: t.examples.orderHistoryDescription,
  };
}

export default async function OrderHistoryPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <OrderHistoryPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
