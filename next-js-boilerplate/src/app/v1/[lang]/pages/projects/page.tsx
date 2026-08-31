import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProjectsPageContent from "@/views/pages/projects/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.projectsTitle,
    description: t.examples.projectsDescription,
  };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ProjectsPageContent initialTab={tab} initialFull={full === "1"} />;
}
