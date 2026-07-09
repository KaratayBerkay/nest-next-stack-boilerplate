import type { Metadata } from "next";
import { Suspense } from "react";
import { getMessages } from "@/lib/i18n/get-messages";
import { FreePageView } from "@/views/users/detail/[uuid]/FreePageView";
import type { UserDetailPageProps } from "@/types/users/UserDetailPage-types";
import type { Lang } from "@/constants/i18n";

export const metadata: Metadata = {
  title: "User Profile",
  description: "View user profile",
};

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "users");
  return (
    <Suspense
      fallback={
        <p className="text-muted animate-pulse text-sm">Loading user...</p>
      }
    >
      <FreePageView t={t} params={params} />
    </Suspense>
  );
}
