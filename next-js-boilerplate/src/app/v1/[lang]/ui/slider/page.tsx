import type { Metadata } from "next";
import PageContent from "@/views/ui/slider/PageContent";

export const metadata: Metadata = {
  title: "Slider",
  description: "Slider component demo",
};

export default function SliderPage() {
  return <PageContent />;
}
