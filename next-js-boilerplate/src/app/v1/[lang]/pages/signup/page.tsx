import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import SignupPageContent from "@/views/pages/signup/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.signupTitle,
    description: t.examples.signupDescription,
  };
}

export default async function SignupPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <SignupPageContent initialTab={tab} initialFull={full === "1"} />;
}
