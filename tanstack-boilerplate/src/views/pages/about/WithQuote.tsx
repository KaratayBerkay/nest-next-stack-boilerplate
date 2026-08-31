"use client";

import Image from "next/image";
import { IconQuote } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function WithQuote() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="bg-surface flex flex-col items-center gap-8 rounded-2xl px-6 py-16 text-center md:px-16">
          <IconQuote size={80} className="text-brand/20 mx-auto" />
          <Typography
            variant="h2"
            className="mx-auto max-w-3xl text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {t.a19Quote}
          </Typography>
          <div className="flex items-center gap-3">
            <Avatar fallback="AC" />
            <div className="flex flex-col items-start gap-0.5 text-left">
              <Typography variant="bodyLarge" className="font-medium">
                {t.a19AuthorName}
              </Typography>
              <Typography variant="caption">{t.a19AuthorRole}</Typography>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {t.a19Heading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a19Body}
            </Typography>
          </div>

          <AspectRatio
            ratio={4 / 3}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="/img/placeholders/ph-4x3-2.webp"
              alt={t.a19ImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}
