import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Permanent Redirect",
  description: "Redirect demo",
};

// permanentRedirect() issues a 308 Permanent Redirect to the target — use it
// when the move is permanent (so clients/search engines update their records).
export default function RedirectPermPage() {
  permanentRedirect("/routing/b");
}
