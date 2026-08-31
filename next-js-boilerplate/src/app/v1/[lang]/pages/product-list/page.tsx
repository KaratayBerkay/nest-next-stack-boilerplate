import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProductListPageContent from "@/views/pages/product-list/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages") as unknown as {
    examples: {
      productListTitle: string;
      productListDescription: string;
    };
  };
  return {
    title: t.examples.productListTitle,
    description: t.examples.productListDescription,
  };
}

export default async function ProductListPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ProductListPageContent initialTab={tab} initialFull={full === "1"} />;
}
