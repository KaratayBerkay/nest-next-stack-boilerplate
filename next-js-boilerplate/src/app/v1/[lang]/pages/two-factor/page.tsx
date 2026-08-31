import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import TwoFactorPageContent from "@/views/pages/two-factor/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.twoFactorTitle,
    description: t.examples.twoFactorDescription,
  };
}

export default async function TwoFactorPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <TwoFactorPageContent initialTab={tab} initialFull={full === "1"} />;
}
