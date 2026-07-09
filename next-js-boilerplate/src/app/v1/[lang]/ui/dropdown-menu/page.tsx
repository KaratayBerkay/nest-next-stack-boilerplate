import type { Metadata } from "next";
import PageContent from "@/views/ui/dropdown-menu/PageContent";

export const metadata: Metadata = {
  title: "Dropdown Menu",
  description: "Dropdown Menu component demo",
};

export default function DropdownMenuPage() {
  return <PageContent />;
}
