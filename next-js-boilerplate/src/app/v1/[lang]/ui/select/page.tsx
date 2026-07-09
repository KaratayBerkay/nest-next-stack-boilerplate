import type { Metadata } from "next";
import PageContent from "@/views/ui/select/PageContent";

export const metadata: Metadata = {
  title: "Select",
  description: "Select component demo",
};

export default function SelectPage() {
  return <PageContent />;
}
