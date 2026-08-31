import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProductGalleryPageContent from "@/views/pages/product-gallery/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.productGalleryTitle,
    description: t.examples.productGalleryDescription,
  };
}

export default async function ProductGalleryPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <ProductGalleryPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
