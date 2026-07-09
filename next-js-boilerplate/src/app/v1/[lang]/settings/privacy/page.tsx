import type { Metadata } from "next";
import PageContent from "@/views/settings/privacy/PageContent";

export const metadata: Metadata = {
  title: "Privacy Settings",
  description: "Manage your privacy settings",
};

export default function PrivacyPage() {
  return <PageContent />;
}
