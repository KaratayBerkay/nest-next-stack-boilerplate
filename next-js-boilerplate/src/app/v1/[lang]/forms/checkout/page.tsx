import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/forms/checkout/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "forms");
  return {
    title: t.examples.checkoutTitle,
    description: t.examples.checkoutDescription,
  };
}

export default function CheckoutPage() {
  return <PageContent />;
}
