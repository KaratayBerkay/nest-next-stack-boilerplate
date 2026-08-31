import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ShaderPageContent from "@/views/pages/shader/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages") as unknown as {
    examples: {
      shaderTitle: string;
      shaderDescription: string;
    };
  };
  return {
    title: t.examples.shaderTitle,
    description: t.examples.shaderDescription,
  };
}

export default async function ShaderPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ShaderPageContent initialTab={tab} initialFull={full === "1"} />;
}
