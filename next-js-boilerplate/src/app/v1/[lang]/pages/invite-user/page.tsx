import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import InviteUserPageContent from "@/views/pages/invite-user/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.inviteUserTitle,
    description: t.examples.inviteUserDescription,
  };
}

export default async function InviteUserPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <InviteUserPageContent initialTab={tab} initialFull={full === "1"} />;
}
