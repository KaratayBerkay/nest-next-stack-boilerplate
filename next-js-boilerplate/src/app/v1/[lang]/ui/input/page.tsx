import type { Metadata } from "next";
import PageContent from "@/views/ui/input/PageContent";

export const metadata: Metadata = {
  title: "Input",
  description: "Input component demo",
};

export default function InputPage() {
  return <PageContent />;
}
