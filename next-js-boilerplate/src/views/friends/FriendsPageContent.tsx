"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { friendsQueryOptions } from "@/api/client/friends/query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/cn";
import type { FriendsPageContentProps } from "@/types/friends/FriendsPageContent-types";
import { FriendsPageSkeleton } from "./FriendsPageSkeleton";

export function FriendsPageContent({ className }: FriendsPageContentProps) {
  const t = useMessages("friends");
  const router = useRouter();
  const { data: friends = [] } = useSuspenseQuery(friendsQueryOptions());

  if (friends.length === 0) {
    return (
      <div className={cn("flex flex-col gap-6 p-4 md:p-6", className)}>
        <Empty
          title={t.noFriends}
          description={t.noFriendsDescription}
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/v1/en/find-friends")}
            >
              {t.findFriends}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 p-4 md:p-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t.title}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/v1/en/find-friends")}
        >
          {t.findFriends}
        </Button>
      </div>

      <Card>
        <CardContent className="divide-border divide-y p-0">
          {friends.map((friend, i) => (
            <button
              key={friend.id}
              onClick={() => router.push(`/v1/en/messages?user=${friend.id}`)}
              className="hover:bg-surface/50 flex w-full items-center gap-4 px-4 py-3 text-left transition-colors"
              style={{ animationDelay: `${i * 15}ms` }}
            >
              <Avatar
                fallback={initials(friend.name ?? friend.email)}
                className="bg-brand text-brand-fg h-10 w-10 shrink-0 text-xs"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {friend.name || friend.email}
                </p>
                {friend.name && (
                  <p className="text-muted truncate text-xs">{friend.email}</p>
                )}
              </div>
              <Badge variant="secondary" size="sm">
                {t.message}
              </Badge>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
