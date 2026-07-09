import type { Metadata } from "next";
import PageContent from "@/views/ui/PageContent";

export const metadata: Metadata = {
  title: "UI Components",
  description: "Component library and design system",
};

export default function UIPage() {
  return <PageContent />;
}
