import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CompareProductsPageContent from "@/views/pages/compare-products/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.compareProductsTitle,
    description: t.examples.compareProductsDescription,
  };
}

export default async function CompareProductsPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <CompareProductsPageContent initialTab={tab} />;
}
