import type { Metadata } from "next";
import PageContent from "@/views/ui/sheet/PageContent";

export const metadata: Metadata = {
  title: "Sheet",
  description: "Sheet component demo",
};

export default function SheetPage() {
  return <PageContent />;
}
