import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/forms/error-lab/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
}

const ERROR_NS = ["auth", "settings", "apiKeys", "forms", "error"] as const;

function loadErrorMessages(locale: Lang) {
  return Object.fromEntries(
    ERROR_NS.map((ns) => [ns, getMessages(locale, ns)]),
  ) as Record<string, Record<string, unknown>>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "forms");
  return {
    title: t.examples.errorLabTitle,
    description: t.examples.errorLabDescription,
  };
}

export default async function ErrorLabPage({ params }: PageProps) {
  const { lang } = await params;
  const errorMessagesByLocale = {
    en: loadErrorMessages("en"),
    tr: loadErrorMessages("tr"),
  };
  return <PageContent errorMessagesByLocale={errorMessagesByLocale} />;
}
