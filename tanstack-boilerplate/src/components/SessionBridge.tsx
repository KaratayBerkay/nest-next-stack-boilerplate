"use client";

import { SessionHydrator } from "@/features/auth/hooks/useAuth";
import type { User } from "@/types/auth/User";

// Streams the SSR session into AuthProvider. Under Next this was an async
// server component; here the root route's loader resolves the session
// server-side and passes it down as plain props. Must render inside
// <AuthProvider>.
export function SessionBridge({
  user,
  token,
}: {
  user: User | null;
  token: string | null;
}) {
  if (!user) return null;
  return <SessionHydrator user={user} token={token} />;
}
