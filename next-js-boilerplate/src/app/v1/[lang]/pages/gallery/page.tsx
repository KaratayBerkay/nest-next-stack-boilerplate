import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import GalleryPageContent from "@/views/pages/gallery/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages") as unknown as {
    examples: { galleryBlocksTitle: string; galleryBlocksDescription: string };
  };
  return {
    title: t.examples.galleryBlocksTitle,
    description: t.examples.galleryBlocksDescription,
  };
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <GalleryPageContent initialTab={tab} initialFull={full === "1"} />;
}
