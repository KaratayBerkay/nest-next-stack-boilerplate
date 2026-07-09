import type { Metadata } from "next";
import PageContent from "@/views/ui/navigation-menu/PageContent";

export const metadata: Metadata = {
  title: "Navigation Menu",
  description: "Navigation Menu component demo",
};

export default function NavigationMenuPage() {
  return <PageContent />;
}
