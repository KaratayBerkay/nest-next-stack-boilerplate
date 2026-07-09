import type { Metadata } from "next";
import PageContent from "@/views/ui/toast/PageContent";

export const metadata: Metadata = {
  title: "Toast",
  description: "Toast component demo",
};

export default function ToastPage() {
  return <PageContent />;
}
