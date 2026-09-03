import { getSessionUser } from "@/lib/auth-ssr";
import { SessionHydrator } from "@/features/auth/hooks/useAuth";

// Streams the SSR session into AuthProvider as RSC props. Replaces the old
// SessionScript window.__INITIAL_USER__ inline scripts, which broke React 19
// hydration when rendered in the body. Must render inside <AuthProvider>.
export async function SessionBridge() {
  const user = await getSessionUser();
  if (!user) return null;

  // Only the user snapshot crosses into client state. The access token is
  // deliberately NOT streamed into the RSC payload: it would sit in the HTML
  // flight data of every SSR'd page, handing any XSS a durable bearer.
  return <SessionHydrator user={user} />;
}
