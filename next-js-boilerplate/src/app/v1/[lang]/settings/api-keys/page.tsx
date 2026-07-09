import type { Metadata } from "next";
import PageContent from "@/views/settings/api-keys/PageContent";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage your API keys",
};

export default function ApiKeysPage() {
  return <PageContent />;
}
