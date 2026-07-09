import type { Metadata } from "next";
import PageContent from "@/views/ui/checkbox/PageContent";

export const metadata: Metadata = {
  title: "Checkbox",
  description: "Checkbox component demo",
};

export default function CheckboxPage() {
  return <PageContent />;
}
