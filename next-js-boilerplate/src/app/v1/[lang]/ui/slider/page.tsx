import type { Metadata } from "next";
import PageContent from "@/views/ui/slider/PageContent";

export const metadata: Metadata = {
  title: "Slider",
  description: "Slider component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SliderPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
