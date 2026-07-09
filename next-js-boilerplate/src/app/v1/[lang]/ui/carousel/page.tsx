import type { Metadata } from "next";
import PageContent from "@/views/ui/carousel/PageContent";

export const metadata: Metadata = {
  title: "Carousel",
  description: "Carousel component demo",
};

export default function CarouselPage() {
  return <PageContent />;
}
