import type { Metadata } from "next";
import PageContent from "@/views/share/PageContent";

export const metadata: Metadata = {
  title: "Share",
  description: "Share a post",
};

export default function SharePage() {
  return <PageContent />;
}
