import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ShopTheLookPageContent from "@/views/pages/shop-the-look/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.shopTheLookTitle,
    description: t.examples.shopTheLookDescription,
  };
}

export default async function ShopTheLookPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ShopTheLookPageContent initialTab={tab} initialFull={full === "1"} />;
}
