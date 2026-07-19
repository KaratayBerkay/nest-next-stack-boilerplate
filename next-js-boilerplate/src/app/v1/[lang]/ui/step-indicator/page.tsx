import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/ui/step-indicator/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "ui");
  return {
    title: t.stepIndicatorTitle,
    description: t.stepIndicatorDescription,
  };
}

export default function StepIndicatorPage() {
  return <PageContent />;
}
