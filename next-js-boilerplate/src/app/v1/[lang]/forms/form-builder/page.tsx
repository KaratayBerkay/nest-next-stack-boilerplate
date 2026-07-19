import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/forms/form-builder/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "forms");
  return {
    title: t.examples.formBuilderTitle,
    description: t.examples.formBuilderDescription,
  };
}

export default function FormBuilderPage() {
  return <PageContent />;
}
