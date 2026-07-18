import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import { RichItemsExample } from "@/views/ui/accordion/RichItemsExample";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return {
    title: t.accordionRichItemsTitle,
    description: t.accordionRichItemsDescription,
  };
}

export default async function RichItemsPage({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return (
    <section className="space-y-4">
      <p className="text-muted text-sm italic">{t.accordionRichItemsText}</p>
      <RichItemsExample />
    </section>
  );
}
