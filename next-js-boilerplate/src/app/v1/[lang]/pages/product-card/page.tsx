import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProductCardPageContent from "@/views/pages/product-card/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages") as unknown as {
    examples: {
      productCardTitle: string;
      productCardDescription: string;
    };
  };
  return {
    title: t.examples.productCardTitle,
    description: t.examples.productCardDescription,
  };
}

export default async function ProductCardPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ProductCardPageContent initialTab={tab} initialFull={full === "1"} />;
}
