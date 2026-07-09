import type { Metadata } from "next";
import PageContent from "@/views/admin/PageContent";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin dashboard",
};

export default function AdminPage() {
  return <PageContent />;
}
