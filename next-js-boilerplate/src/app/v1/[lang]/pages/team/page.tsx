import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import TeamPageContent from "@/views/pages/team/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.teamTitle,
    description: t.examples.teamDescription,
  };
}

export default async function TeamPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <TeamPageContent initialTab={tab} initialFull={full === "1"} />;
}
