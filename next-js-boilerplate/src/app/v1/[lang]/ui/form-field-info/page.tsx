import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/ui/form-field-info/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return {
    title: t.formFieldInfoTitle,
    description: t.formFieldInfoDescription,
  };
}

export default function FormFieldInfoPage() {
  return <PageContent />;
}
