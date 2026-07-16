"use client";

import { useState } from "react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { cn } from "@/lib/cn";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ImageWithSkeleton({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700",
          loaded && "hidden",
        )}
      />
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}

const GRID_IMAGES = [
  { id: 1015, alt: "River in mountains" },
  { id: 1016, alt: "Snowy mountains" },
  { id: 1018, alt: "Misty forest" },
  { id: 1019, alt: "Beach sunset" },
  { id: 1022, alt: "Mountain lake" },
  { id: 1025, alt: "Pug portrait" },
];

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Video 16:9",
    description: "Embed placeholder with 16:9 aspect ratio.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">16:9</h3>
          <AspectRatio ratio={16 / 9} className="bg-surface relative rounded-md">
            <ImageWithSkeleton
              src="https://picsum.photos/id/1040/800/450"
              alt="Mountain landscape"
            />
          </AspectRatio>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Square Grid",
    description: "1:1 gallery grid of items.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Square Grid</h3>
          <div className="grid grid-cols-3 gap-2">
            {GRID_IMAGES.map((img) => (
              <AspectRatio key={img.id} ratio={1} className="bg-surface relative rounded-md">
                <ImageWithSkeleton
                  src={`https://picsum.photos/id/${img.id}/400/400`}
                  alt={img.alt}
                />
              </AspectRatio>
            ))}
          </div>
        </section>
      </div>
    ),
  },
];

export default function AspectRatioPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Aspect Ratio"
      intro="Displays content within a desired ratio."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
