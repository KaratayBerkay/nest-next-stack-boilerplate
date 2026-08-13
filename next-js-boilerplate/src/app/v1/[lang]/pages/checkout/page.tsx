import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CheckoutPageContent from "@/views/pages/checkout/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.checkoutTitle,
    description: t.examples.checkoutDescription,
  };
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <CheckoutPageContent initialTab={tab} />;
}
