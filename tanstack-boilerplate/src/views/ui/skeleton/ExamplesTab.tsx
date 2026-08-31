"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function ExamplesTab({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Profile Card Loading</h3>
      <p className="text-muted mb-2 text-xs">
        Toggle loading state to see skeletons in a realistic layout.
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setLoading((p) => !p)}
        className="mb-3 w-fit"
      >
        {loading ? "Show Loaded" : "Show Loading"}
      </Button>
      <div className="surface max-w-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4">
            <Avatar
              src="https://i.pravatar.cc/80?img=12"
              alt="User"
              fallback="JD"
              size="md"
            />
            <div>
              <p className="text-sm font-medium">Jane Doe</p>
              <p className="text-muted text-xs">jane@example.com</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
