import type { Metadata } from "next";
import PageContent from "@/views/ui/image-upload/PageContent";

export const metadata: Metadata = {
  title: "Image Upload",
  description: "Image upload component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ImageUploadPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
