import type { Metadata } from "next";
import PageContent from "@/views/ui/card/PageContent";

export const metadata: Metadata = {
  title: "Card",
  description: "Card component demo",
};

export default function CardPage() {
  return <PageContent />;
}
