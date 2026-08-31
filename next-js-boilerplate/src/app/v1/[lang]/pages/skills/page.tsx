import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import SkillsPageContent from "@/views/pages/skills/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.skillsTitle,
    description: t.examples.skillsDescription,
  };
}

export default async function SkillsPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <SkillsPageContent initialTab={tab} initialFull={full === "1"} />;
}
