import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProductSpecsPageContent from "@/views/pages/product-specs/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.productSpecsTitle,
    description: t.examples.productSpecsDescription,
  };
}

export default async function ProductSpecsPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <ProductSpecsPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
