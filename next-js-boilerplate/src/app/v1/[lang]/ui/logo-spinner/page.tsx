import type { Metadata } from "next";
import PageContent from "@/views/ui/logo-spinner/PageContent";

export const metadata: Metadata = {
  title: "Logo Spinner",
  description: "Logo Spinner component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function LogoSpinnerPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
