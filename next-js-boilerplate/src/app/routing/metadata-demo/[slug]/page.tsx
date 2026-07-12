import { Suspense } from "react";
import type { Metadata } from "next";
import { MetadataDemoFallback } from "@/fallbacks";
import type { SlugPageProps } from "@/types/routing/SlugPage-types";

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — dynamic`,
    description: `Dynamically generated metadata for slug: ${slug}.`,
    openGraph: {
      title: `${slug} — OG`,
      description: `OG description for ${slug}.`,
    },
  };
}

async function SlugContent({ params }: SlugPageProps) {
  const { slug } = await params;
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Slug: {slug}</h1>
      <p className="text-muted text-sm">
        This page uses <code>generateMetadata</code> to set the title and OG
        tags dynamically based on the route param.
      </p>
    </>
  );
}

export default function SlugPage({ params }: SlugPageProps) {
  return (
    <div className="flex flex-col gap-2">
      <Suspense fallback={<MetadataDemoFallback />}>
        <SlugContent params={params} />
      </Suspense>
    </div>
  );
}
