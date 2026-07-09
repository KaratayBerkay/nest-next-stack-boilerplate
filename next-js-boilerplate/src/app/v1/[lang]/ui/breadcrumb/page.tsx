import type { Metadata } from "next";
import PageContent from "@/views/ui/breadcrumb/PageContent";

export const metadata: Metadata = {
  title: "Breadcrumb",
  description: "Breadcrumb component demo",
};

export default function BreadcrumbPage() {
  return <PageContent />;
}
