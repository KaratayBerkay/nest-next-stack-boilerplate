import type { Metadata } from "next";
import PageContent from "@/views/settings/billing/PageContent";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your billing and subscription",
};

export default function BillingPage() {
  return <PageContent />;
}
