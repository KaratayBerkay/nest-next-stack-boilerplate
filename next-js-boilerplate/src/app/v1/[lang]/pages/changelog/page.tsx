import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ChangelogPageContent from "@/views/pages/changelog/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.changelogTitle,
    description: t.examples.changelogDescription,
  };
}

export default async function ChangelogPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ChangelogPageContent initialTab={tab} initialFull={full === "1"} />;
}
