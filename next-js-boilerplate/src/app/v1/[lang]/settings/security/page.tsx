import type { Metadata } from "next";
import SecurityPageContent from "@/views/settings/security/PageContent";

export const metadata: Metadata = {
  title: "Security Settings",
  description: "Manage two-factor authentication",
};

export default function SecurityPage() {
  return <SecurityPageContent />;
}
