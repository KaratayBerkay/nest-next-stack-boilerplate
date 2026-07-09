import type { Metadata } from "next";
import { Suspense } from "react";
import { getMessages } from "@/lib/i18n/get-messages";
import { FreePageView } from "@/views/users/list/FreePageView";
import { UsersListFallback } from "@/fallbacks";
import type { UsersListPageProps, UsersListContentProps } from "@/types/users/UsersListPage-types";
import type { Lang } from "@/constants/i18n";

export const metadata: Metadata = {
  title: "Users",
  description: "Browse users",
};

export default function UsersListPage({
  params,
}: UsersListPageProps) {
  return (
    <Suspense fallback={<UsersListFallback />}>
      <UsersListContent params={params} />
    </Suspense>
  );
}

async function UsersListContent({
  params,
}: UsersListContentProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "users");
  return <FreePageView t={t} lang={lang} />;
}
