import type { Metadata } from "next";
import PageContent from "@/views/ui/button/PageContent";

export const metadata: Metadata = {
  title: "Button",
  description: "Button component demo",
};

export default function ButtonPage() {
  return <PageContent />;
}
