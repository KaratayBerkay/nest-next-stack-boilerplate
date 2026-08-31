"use client";

import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

export function FriendsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-24" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <Card>
        <CardContent className="divide-border divide-y p-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <SkeletonLine width="w-32" />
                <SkeletonLine width="w-48" className="mt-1" />
              </div>
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
