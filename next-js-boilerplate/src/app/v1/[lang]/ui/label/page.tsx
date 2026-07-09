import type { Metadata } from "next";
import PageContent from "@/views/ui/label/PageContent";

export const metadata: Metadata = {
  title: "Label",
  description: "Label component demo",
};

export default function LabelPage() {
  return <PageContent />;
}
