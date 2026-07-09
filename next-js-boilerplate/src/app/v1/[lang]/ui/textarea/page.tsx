import type { Metadata } from "next";
import PageContent from "@/views/ui/textarea/PageContent";

export const metadata: Metadata = {
  title: "Textarea",
  description: "Textarea component demo",
};

export default function TextareaPage() {
  return <PageContent />;
}
