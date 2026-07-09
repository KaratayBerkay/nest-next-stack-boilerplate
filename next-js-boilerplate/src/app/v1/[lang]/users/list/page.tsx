import type { Metadata } from "next";
import { Suspense } from "react";
import { getMessages } from "@/lib/i18n/get-messages";
import { FreePageView } from "@/views/users/list/FreePageView";
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
    <Suspense
      fallback={
        <p className="animate-pulse text-sm text-muted">Loading users...</p>
      }
    >
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
