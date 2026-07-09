"use client";

import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { FindFriendsFallback } from "@/fallbacks";
import { FreeFindFriendsContent } from "./FreeFindFriendsContent";

export function FreePageView() {
  const { user, loading } = useAuth();
  const t = useMessages("find-friends");

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInRequired} />;

  return (
    <Suspense fallback={<FindFriendsFallback />}>
      <FreeFindFriendsContent user={user} />
    </Suspense>
  );
}
