"use client";

import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { SkeletonLine, SkeletonMessage } from "@/components/ui/skeleton-shapes";
import { MediumFindFriendsContent } from "./MediumFindFriendsContent";

export function MediumPageView() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message="Sign in to find friends" />;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <SkeletonLine width="30%" className="h-5" />
          <div className="flex gap-1">
            <SkeletonLine className="h-8 flex-1" />
            <SkeletonLine className="h-8 flex-1" />
          </div>
          <SkeletonLine width="100%" className="h-9" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonMessage key={i} />
            ))}
          </div>
        </div>
      }
    >
      <MediumFindFriendsContent user={user} />
    </Suspense>
  );
}
