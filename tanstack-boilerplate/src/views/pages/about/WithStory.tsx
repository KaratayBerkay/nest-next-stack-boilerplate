"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const STORY_CHAPTERS = [
  {
    src: "/img/placeholders/ph-4x3-5.webp",
    altKey: "a13Chapter1ImageAlt",
    headingKey: "a13Chapter1Heading",
    bodyKey: "a13Chapter1Body",
    ratio: 4 / 3,
  },
  {
    src: "/img/placeholders/ph-4x3-2.webp",
    altKey: "a13Chapter2ImageAlt",
    headingKey: "a13Chapter2Heading",
    bodyKey: "a13Chapter2Body",
    ratio: 4 / 3,
  },
  {
    src: "/img/placeholders/ph-4x3-2.webp",
    altKey: "a13Chapter3ImageAlt",
    headingKey: "a13Chapter3Heading",
    bodyKey: "a13Chapter3Body",
    ratio: 4 / 3,
  },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithStory() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-24 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a13Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.a13Intro}
          </Typography>
        </div>

        <div className="flex flex-col gap-16 lg:gap-24">
          {STORY_CHAPTERS.map((chapter, index) => {
            const reversed = index === 1;
            return (
              <div
                key={chapter.src}
                className={cn(
                  "flex flex-col gap-6 md:items-center md:gap-12 lg:gap-20",
                  reversed ? "md:flex-row-reverse" : "md:flex-row",
                )}
              >
                <div className="md:w-1/2">
                  <AspectRatio
                    ratio={chapter.ratio}
                    className="bg-surface relative rounded-2xl"
                  >
                    <Image
                      src={chapter.src}
                      alt={t[chapter.altKey]}
                      fill
                      sizes={IMAGE_SIZES}
                      className="object-cover"
                    />
                  </AspectRatio>
                </div>
                <div className="flex flex-col gap-3 md:w-1/2">
                  <span className="text-muted font-mono text-sm tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Typography
                    variant="h3"
                    className="text-2xl font-medium tracking-tighter md:text-3xl"
                  >
                    {t[chapter.headingKey]}
                  </Typography>
                  <Typography variant="body" className="text-muted">
                    {t[chapter.bodyKey]}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
