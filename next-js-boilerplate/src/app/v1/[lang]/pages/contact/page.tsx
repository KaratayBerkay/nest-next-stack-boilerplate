import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ContactPageContent from "@/views/pages/contact/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.contactTitle,
    description: t.examples.contactDescription,
  };
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ContactPageContent initialTab={tab} initialFull={full === "1"} />;
}
