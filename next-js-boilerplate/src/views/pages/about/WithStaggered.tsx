"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface GalleryImage {
  src: string;
  altKey: "a28Image1Alt" | "a28Image2Alt" | "a28Image3Alt" | "a28Image4Alt";
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "https://picsum.photos/seed/about28-1/900/1200",
    altKey: "a28Image1Alt",
  },
  {
    src: "https://picsum.photos/seed/about28-2/900/1200",
    altKey: "a28Image2Alt",
  },
  {
    src: "https://picsum.photos/seed/about28-3/900/1200",
    altKey: "a28Image3Alt",
  },
  {
    src: "https://picsum.photos/seed/about28-4/900/1200",
    altKey: "a28Image4Alt",
  },
];

const VALUE_BULLETS = [
  { titleKey: "a28Bullet1Title", bodyKey: "a28Bullet1Body" },
  { titleKey: "a28Bullet2Title", bodyKey: "a28Bullet2Body" },
  { titleKey: "a28Bullet3Title", bodyKey: "a28Bullet3Body" },
] as const;

function GalleryImage({ image, alt }: { image: GalleryImage; alt: string }) {
  return (
    <AspectRatio ratio={3 / 4} className="bg-surface relative rounded-2xl">
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </AspectRatio>
  );
}

export function WithStaggered() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.a28Label}</Typography>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a28Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.a28Body}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <GalleryImage image={GALLERY_IMAGES[0]} alt={t.a28Image1Alt} />
            <GalleryImage image={GALLERY_IMAGES[1]} alt={t.a28Image2Alt} />
          </div>
          <div className="flex flex-col gap-6 md:mt-16">
            <GalleryImage image={GALLERY_IMAGES[2]} alt={t.a28Image3Alt} />
            <GalleryImage image={GALLERY_IMAGES[3]} alt={t.a28Image4Alt} />
          </div>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {t.a28ValueHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a28ValueBody}
            </Typography>
          </div>

          <Card className="flex flex-col gap-6 p-8">
            {VALUE_BULLETS.map((bullet) => (
              <div key={bullet.titleKey} className="flex items-start gap-4">
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <IconCheck size={20} className="text-brand" />
                </div>
                <div className="flex flex-col gap-1">
                  <Typography
                    variant="h3"
                    className="text-lg font-medium tracking-tight"
                  >
                    {t[bullet.titleKey]}
                  </Typography>
                  <Typography variant="body" className="text-muted">
                    {t[bullet.bodyKey]}
                  </Typography>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </section>
  );
}
