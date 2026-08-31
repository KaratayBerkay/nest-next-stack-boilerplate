import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import EcommerceFooterPageContent from "@/views/pages/ecommerce-footer/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.ecommerceFooterTitle,
    description: t.examples.ecommerceFooterDescription,
  };
}

export default async function EcommerceFooterPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <EcommerceFooterPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
