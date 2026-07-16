import type { Metadata } from "next";
import PageContent from "@/views/ui/carousel/PageContent";

export const metadata: Metadata = {
  title: "Carousel",
  description: "Carousel component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CarouselPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
