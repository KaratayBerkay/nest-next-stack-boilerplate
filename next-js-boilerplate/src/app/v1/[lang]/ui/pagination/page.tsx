import type { Metadata } from "next";
import PageContent from "@/views/ui/pagination/PageContent";

export const metadata: Metadata = {
  title: "Pagination",
  description: "Pagination component demo",
};

export default function PaginationPage() {
  return <PageContent />;
}
