import type { Metadata } from "next";
import PageContent from "@/views/ui/menubar/PageContent";

export const metadata: Metadata = {
  title: "Menubar",
  description: "Menubar component demo",
};

export default function MenubarPage() {
  return <PageContent />;
}
