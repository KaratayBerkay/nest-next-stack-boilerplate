import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import EcommerceHeroPageContent from "@/views/pages/ecommerce-hero/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.ecommerceHeroTitle,
    description: t.examples.ecommerceHeroDescription,
  };
}

export default async function EcommerceHeroPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <EcommerceHeroPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
