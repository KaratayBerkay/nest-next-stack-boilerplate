import type { Metadata } from "next";
import PageContent from "@/views/ui/typography/PageContent";

export const metadata: Metadata = {
  title: "Typography",
  description: "Typography component demo",
};

export default function TypographyPage() {
  return <PageContent />;
}
