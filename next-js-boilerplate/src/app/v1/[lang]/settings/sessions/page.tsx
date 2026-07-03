"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";

export default function SessionsPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message="Sign in to manage sessions" />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">Sessions & Devices</h2>
      <div className="text-muted flex items-center justify-center py-12 text-sm">
        Sessions are managed automatically. You&apos;ll be logged out after 15
        minutes of inactivity.
      </div>
    </div>
  );
}
