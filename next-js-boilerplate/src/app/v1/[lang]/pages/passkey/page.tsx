import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PasskeyPageContent from "@/views/pages/passkey/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.passkeyTitle,
    description: t.examples.passkeyDescription,
  };
}

export default async function PasskeyPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <PasskeyPageContent initialTab={tab} initialFull={full === "1"} />;
}
