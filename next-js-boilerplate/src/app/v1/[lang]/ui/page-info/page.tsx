import type { Metadata } from "next";
import PageContent from "@/views/ui/page-info/PageContent";

export const metadata: Metadata = {
  title: "Page Info",
  description: "Page Info component demo",
};

export default function PageInfoPage() {
  return <PageContent />;
}
