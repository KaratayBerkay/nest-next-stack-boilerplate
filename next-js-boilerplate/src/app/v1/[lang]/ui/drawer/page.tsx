import type { Metadata } from "next";
import PageContent from "@/views/ui/drawer/PageContent";

export const metadata: Metadata = {
  title: "Drawer",
  description: "Drawer component demo",
};

export default function DrawerPage() {
  return <PageContent />;
}
