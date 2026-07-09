import type { Metadata } from "next";
import PageContent from "@/views/ui/command/PageContent";

export const metadata: Metadata = {
  title: "Command",
  description: "Command component demo",
};

export default function CommandPage() {
  return <PageContent />;
}
