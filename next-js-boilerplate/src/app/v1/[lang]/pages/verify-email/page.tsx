import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import VerifyEmailPageContent from "@/views/pages/verify-email/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.verifyEmailTitle,
    description: t.examples.verifyEmailDescription,
  };
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <VerifyEmailPageContent initialTab={tab} initialFull={full === "1"} />;
}
