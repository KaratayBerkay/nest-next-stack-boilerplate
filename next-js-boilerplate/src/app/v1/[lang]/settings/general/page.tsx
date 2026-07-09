import type { Metadata } from "next";
import PageContent from "@/views/settings/general/PageContent";

export const metadata: Metadata = {
  title: "General Settings",
  description: "General preferences",
};

export default function GeneralPage() {
  return <PageContent />;
}
