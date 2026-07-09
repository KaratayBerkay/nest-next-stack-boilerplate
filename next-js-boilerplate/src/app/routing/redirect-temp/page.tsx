import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Temporary Redirect",
  description: "Redirect demo",
};

// redirect() called during a Server Component render issues a 307 Temporary
// Redirect (for this GET) to the target, then never returns.
export default function RedirectTempPage() {
  redirect("/routing/a");
}
