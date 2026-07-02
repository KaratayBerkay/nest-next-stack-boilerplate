import { redirect } from "next/navigation";

// redirect() called during a Server Component render issues a 307 Temporary
// Redirect (for this GET) to the target, then never returns.
export default function RedirectTempPage() {
  redirect("/routing/a");
}
