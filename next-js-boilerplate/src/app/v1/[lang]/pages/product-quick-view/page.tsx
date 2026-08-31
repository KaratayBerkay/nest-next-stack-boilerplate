import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProductQuickViewPageContent from "@/views/pages/product-quick-view/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.productQuickViewTitle,
    description: t.examples.productQuickViewDescription,
  };
}

export default async function ProductQuickViewPage({
  searchParams,
}: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <ProductQuickViewPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
