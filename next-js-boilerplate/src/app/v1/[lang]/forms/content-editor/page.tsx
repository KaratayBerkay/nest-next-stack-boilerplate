import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/forms/content-editor/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "forms");
  return {
    title: t.examples.contentEditorTitle,
    description: t.examples.contentEditorDescription,
  };
}

export default function ContentEditorPage() {
  return <PageContent />;
}
