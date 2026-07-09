import type { Metadata } from "next";
import PageContent from "@/views/settings/PageContent";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings",
};

export default function SettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return <PageContent params={params} />;
}
