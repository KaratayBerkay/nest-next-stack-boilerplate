import type { Metadata } from "next";
import PageContent from "@/views/ui/spinner/PageContent";

export const metadata: Metadata = {
  title: "Spinner",
  description: "Spinner component demo",
};

export default function SpinnerPage() {
  return <PageContent />;
}
