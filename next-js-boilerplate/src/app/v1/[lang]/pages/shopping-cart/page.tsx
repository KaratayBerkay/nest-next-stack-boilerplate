import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ShoppingCartPageContent from "@/views/pages/shopping-cart/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.shoppingCartTitle,
    description: t.examples.shoppingCartDescription,
  };
}

export default async function ShoppingCartPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <ShoppingCartPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
