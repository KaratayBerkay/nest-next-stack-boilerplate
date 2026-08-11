"use client";

import Image from "next/image";
import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogMessages } from "@/types/pages/blog/BlogBlock-types";

const PHOTO_SEEDS = [
  "blog46-1",
  "blog46-2",
  "blog46-3",
  "blog46-4",
  "blog46-5",
  "blog46-6",
];

const PHOTO_SIZES = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";

function handleEmailChange(
  event: ChangeEvent<HTMLInputElement>,
  setEmail: Dispatch<SetStateAction<string>>,
) {
  setEmail(event.target.value);
}

function handleNewsletterSubmit(
  event: FormEvent<HTMLFormElement>,
  setEmail: Dispatch<SetStateAction<string>>,
) {
  event.preventDefault();
  setEmail("");
}

export function WithNewsletterPhotoGrid() {
  const t = useMessages("pages").blog as unknown as BlogMessages;
  const [email, setEmail] = useState("");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="border-border flex flex-col gap-8 border-b pb-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl flex-col gap-4">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.blog46Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {t.blog46Description}
            </Typography>
          </div>
          <form
            onSubmit={(event) => handleNewsletterSubmit(event, setEmail)}
            className="flex w-full max-w-md flex-col gap-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => handleEmailChange(event, setEmail)}
                placeholder={t.blog46EmailPlaceholder}
                aria-label={t.blog46EmailPlaceholder}
                className="flex-1"
              />
              <Button type="submit" variant="primary">
                {t.blog46Subscribe}
              </Button>
            </div>
            <Typography variant="caption">{t.blog46Hint}</Typography>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-4 py-12 lg:grid-cols-3">
          {PHOTO_SEEDS.map((seed) => (
            <AspectRatio
              key={seed}
              ratio={4 / 3}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src={`https://picsum.photos/seed/${seed}/800/600`}
                alt=""
                aria-hidden="true"
                fill
                sizes={PHOTO_SIZES}
                className="object-cover"
              />
            </AspectRatio>
          ))}
        </div>
      </div>
    </section>
  );
}
