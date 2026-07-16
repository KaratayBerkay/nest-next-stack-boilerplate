import type { Metadata } from "next";
import PageContent from "@/views/ui/file-upload/PageContent";

export const metadata: Metadata = {
  title: "File Upload",
  description: "File upload component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function FileUploadPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
