import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import { SingleStateExample } from "@/views/ui/accordion/SingleStateExample";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return {
    title: t.accordionTitle,
    description: t.accordionDescription,
  };
}

export default async function UsagePage({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return (
    <section className="space-y-4">
      <p className="text-muted text-sm italic">{t.accordionText}</p>
      <SingleStateExample />
    </section>
  );
}
