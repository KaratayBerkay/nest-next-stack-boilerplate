import type { Metadata } from "next";
import UsagePageContent from "@/views/settings/usage/PageContent";

export const metadata: Metadata = {
  title: "Usage Settings",
  description: "Track message and upload storage usage",
};

export default function UsagePage() {
  return <UsagePageContent />;
}
