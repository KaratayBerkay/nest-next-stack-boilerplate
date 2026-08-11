import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/pages/application-shell/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.applicationShellTitle,
    description: t.examples.applicationShellDescription,
  };
}

export default async function ApplicationShellPage({
  searchParams,
}: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
