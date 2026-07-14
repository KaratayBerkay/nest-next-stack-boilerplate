import { getSessionUser } from "@/lib/auth-ssr";
import { getAccessToken } from "@/store/ssr-cookies";
import { SessionHydrator } from "@/features/auth/hooks/useAuth";

// Streams the SSR session into AuthProvider as RSC props. Replaces the old
// SessionScript window.__INITIAL_USER__ inline scripts, which broke React 19
// hydration when rendered in the body. Must render inside <AuthProvider>.
export async function SessionBridge() {
  const user = await getSessionUser();
  if (!user) return null;

  const accessToken = await getAccessToken();
  return <SessionHydrator user={user} token={accessToken ?? null} />;
}
