import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import { MultiStateExample } from "@/views/ui/accordion/MultiStateExample";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return {
    title: t.accordionVariantsTitle,
    description: t.accordionVariantsDescription,
  };
}

export default async function VariantsPage({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return (
    <section className="space-y-4">
      <p className="text-muted text-sm italic">{t.accordionVariantsText}</p>
      <MultiStateExample />
    </section>
  );
}
