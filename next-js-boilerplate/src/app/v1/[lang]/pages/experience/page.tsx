import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ExperiencePageContent from "@/views/pages/experience/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.experienceTitle,
    description: t.examples.experienceDescription,
  };
}

export default async function ExperiencePage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <ExperiencePageContent initialTab={tab} />;
}
