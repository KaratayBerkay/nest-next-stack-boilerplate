import type { Metadata } from "next";
import PageContent from "@/views/settings/account/PageContent";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account",
};

export default function AccountPage() {
  return <PageContent />;
}
