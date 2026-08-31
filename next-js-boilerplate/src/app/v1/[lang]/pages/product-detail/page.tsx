import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProductDetailPageContent from "@/views/pages/product-detail/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.productDetailTitle,
    description: t.examples.productDetailDescription,
  };
}

export default async function ProductDetailPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <ProductDetailPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
