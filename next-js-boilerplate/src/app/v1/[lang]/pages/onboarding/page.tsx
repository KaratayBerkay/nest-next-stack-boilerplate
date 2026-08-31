import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import OnboardingPageContent from "@/views/pages/onboarding/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.onboardingTitle,
    description: t.examples.onboardingDescription,
  };
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <OnboardingPageContent initialTab={tab} initialFull={full === "1"} />;
}
