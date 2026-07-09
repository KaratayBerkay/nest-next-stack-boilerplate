import type { Metadata } from "next";
import PageContent from "@/views/ui/table/PageContent";

export const metadata: Metadata = {
  title: "Table",
  description: "Table component demo",
};

export default function TablePage() {
  return <PageContent />;
}
