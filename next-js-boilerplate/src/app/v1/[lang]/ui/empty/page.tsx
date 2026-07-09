import type { Metadata } from "next";
import PageContent from "@/views/ui/empty/PageContent";

export const metadata: Metadata = {
  title: "Empty",
  description: "Empty component demo",
};

export default function EmptyPage() {
  return <PageContent />;
}
