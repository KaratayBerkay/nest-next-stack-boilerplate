import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProjectPageContent from "@/views/pages/project/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.projectTitle,
    description: t.examples.projectDescription,
  };
}

export default async function ProjectPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ProjectPageContent initialTab={tab} initialFull={full === "1"} />;
}
