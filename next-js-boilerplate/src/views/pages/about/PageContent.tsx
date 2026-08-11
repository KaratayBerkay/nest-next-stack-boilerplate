"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface AboutImage {
  src: string;
  alt: string;
  ratio: number;
  className?: string;
}

const LEFT_COLUMN_IMAGES: AboutImage[] = [
  {
    src: "https://picsum.photos/seed/about6-team-1/800/1000",
    alt: "Team collaborating around a table",
    ratio: 4 / 5,
  },
  {
    src: "https://picsum.photos/seed/about6-team-2/800/600",
    alt: "Office whiteboard with sketches",
    ratio: 4 / 3,
  },
  {
    src: "https://picsum.photos/seed/about6-team-3/800/600",
    alt: "Team members walking in the office",
    ratio: 4 / 3,
  },
];

const RIGHT_COLUMN_IMAGES: AboutImage[] = [
  {
    src: "https://picsum.photos/seed/about6-work-1/800/1000",
    alt: "Designer reviewing work on a monitor",
    ratio: 4 / 5,
  },
  {
    src: "https://picsum.photos/seed/about6-work-2/800/1000",
    alt: "Hands typing on a laptop",
    ratio: 4 / 5,
  },
  {
    src: "https://picsum.photos/seed/about6-work-3/800/600",
    alt: "Modern office lounge area",
    ratio: 4 / 3,
  },
];

const IMAGE_SIZES = "(max-width: 768px) 50vw, 25vw";

function PhotoGridItem({ image }: { image: AboutImage }) {
  return (
    <AspectRatio
      ratio={image.ratio}
      className="bg-surface relative rounded-2xl"
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={IMAGE_SIZES}
        className="object-cover"
      />
    </AspectRatio>
  );
}

export default function AboutPageContent() {
  const t = useMessages("pages").about;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">About</h2>
        <p className="text-muted text-xs">
          Story and workplace photo grid — shadcnblocks about6
        </p>
      </div>

      <section className="w-full py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Typography
                variant="h2"
                className="max-w-xl text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {t.heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted max-w-md">
                {t.intro}
              </Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-4">
                <PhotoGridItem image={LEFT_COLUMN_IMAGES[0]} />
                <PhotoGridItem image={LEFT_COLUMN_IMAGES[1]} />
              </div>
              <div className="mt-8 grid gap-4">
                <PhotoGridItem image={LEFT_COLUMN_IMAGES[2]} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:mt-24">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-4">
                <PhotoGridItem image={RIGHT_COLUMN_IMAGES[0]} />
              </div>
              <div className="mt-8 grid gap-4">
                <PhotoGridItem image={RIGHT_COLUMN_IMAGES[1]} />
                <PhotoGridItem image={RIGHT_COLUMN_IMAGES[2]} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tighter md:text-3xl"
              >
                {t.workplaceHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.workplaceParagraph1}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.workplaceParagraph2}
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
