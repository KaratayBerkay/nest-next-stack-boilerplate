import { getSessionUser } from "@/lib/auth-ssr";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryProvider } from "@/integrations/tanstack-query/QueryProvider";
import type { User } from "@/features/auth/hooks/useAuth";
import type { ReactNode } from "react";

export async function SeedAuth({ children }: { children: ReactNode }) {
  let initialUser: User | null = null;
  try {
    initialUser = await getSessionUser();
  } catch {
    /* SSR seed is best-effort; client fallback handles it */
  }
  return (
    <AuthProvider initialUser={initialUser}>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
}
