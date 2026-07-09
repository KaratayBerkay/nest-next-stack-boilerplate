import type { Metadata } from "next";
import PageContent from "@/views/ui/alert/PageContent";

export const metadata: Metadata = {
  title: "Alert",
  description: "Alert component demo",
};

export default function AlertPage() {
  return <PageContent />;
}
