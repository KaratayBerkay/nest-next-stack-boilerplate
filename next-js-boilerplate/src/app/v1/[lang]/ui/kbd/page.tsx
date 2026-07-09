import type { Metadata } from "next";
import PageContent from "@/views/ui/kbd/PageContent";

export const metadata: Metadata = {
  title: "Kbd",
  description: "Kbd component demo",
};

export default function KbdPage() {
  return <PageContent />;
}
