import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PaymentMethodsPageContent from "@/views/pages/payment-methods/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.paymentMethodsTitle,
    description: t.examples.paymentMethodsDescription,
  };
}

export default async function PaymentMethodsPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <PaymentMethodsPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
