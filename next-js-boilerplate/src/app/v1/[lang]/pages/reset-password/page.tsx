import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ResetPasswordPageContent from "@/views/pages/reset-password/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.resetPasswordTitle,
    description: t.examples.resetPasswordDescription,
  };
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <ResetPasswordPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
