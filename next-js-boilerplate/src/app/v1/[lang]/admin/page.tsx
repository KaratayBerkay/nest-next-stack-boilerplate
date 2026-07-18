import { getMessages } from "@/lib/i18n/get-messages";
import PageContent from "@/views/admin/PageContent";
import type { Lang } from "@/constants/i18n";

interface AdminPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: AdminPageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "admin");
  return { title: t.title };
}

export default function AdminPage() {
  return <PageContent />;
}
