import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CodeExamplePageContent from "@/views/pages/code-example/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.codeExampleTitle,
    description: t.examples.codeExampleDescription,
  };
}

export default async function CodeExamplePage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <CodeExamplePageContent initialTab={tab} initialFull={full === "1"} />;
}
