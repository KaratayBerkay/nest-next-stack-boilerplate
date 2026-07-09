import type { Metadata } from "next";
import PageContent from "@/views/ui/dialog/PageContent";

export const metadata: Metadata = {
  title: "Dialog",
  description: "Dialog component demo",
};

export default function DialogPage() {
  return <PageContent />;
}
