import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProductSearchPageContent from "@/views/pages/product-search/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.productSearchTitle,
    description: t.examples.productSearchDescription,
  };
}

export default async function ProductSearchPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <ProductSearchPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
