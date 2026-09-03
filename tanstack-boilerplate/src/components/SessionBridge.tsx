"use client";

import { SessionHydrator } from "@/features/auth/hooks/useAuth";
import type { User } from "@/types/auth/User";

// Streams the SSR session into AuthProvider. Under Next this was an async
// server component; here the root route's loader resolves the session
// server-side and passes it down as plain props. Must render inside
// <AuthProvider>.
export function SessionBridge({ user }: { user: User | null }) {
  if (!user) return null;
  // Only the user snapshot crosses into client state — never the access
  // token (see __root.tsx's loader for why).
  return <SessionHydrator user={user} />;
}
