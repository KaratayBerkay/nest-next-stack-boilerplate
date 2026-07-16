import type { Metadata } from "next";
import PageContent from "@/views/ui/scroll-to-bottom-button/PageContent";

export const metadata: Metadata = {
  title: "Scroll To Bottom Button",
  description: "Scroll To Bottom Button component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ScrollToBottomButtonPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
