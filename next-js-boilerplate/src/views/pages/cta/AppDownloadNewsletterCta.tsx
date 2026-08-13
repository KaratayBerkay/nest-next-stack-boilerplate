"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import {
  IconArrowRight,
  IconBrandApple,
  IconBrandGooglePlay,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;
const PHONE_IMAGE = "https://picsum.photos/seed/cta22-phone/600/1200" as const;
const STORE_BADGE_CLASS =
  "bg-bg text-fg flex items-center gap-3 rounded-xl px-5 py-3 transition-colors hover:bg-bg/90" as const;

function handleNewsletterSubmit(
  e: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  e.preventDefault();
  setSubmitted(true);
}

export function AppDownloadNewsletterCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-fg text-bg relative overflow-hidden rounded-3xl sm:col-span-2">
            <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-end">
              <div className="flex max-w-lg flex-col items-start gap-5">
                <Typography
                  variant="h2"
                  className="text-3xl font-medium tracking-tighter md:text-4xl"
                >
                  {co.cta22Title}
                </Typography>
                <Typography variant="bodyLarge" className="text-bg/70">
                  {co.cta22Body}
                </Typography>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <a href={LINK_URL} className={STORE_BADGE_CLASS}>
                    <IconBrandApple size={28} />
                    <span className="flex flex-col items-start">
                      <span className="text-xs">{co.cta22AppStorePrefix}</span>
                      <span className="text-base font-semibold">App Store</span>
                    </span>
                  </a>
                  <a href={LINK_URL} className={STORE_BADGE_CLASS}>
                    <IconBrandGooglePlay size={26} />
                    <span className="flex flex-col items-start">
                      <span className="text-xs">
                        {co.cta22GooglePlayPrefix}
                      </span>
                      <span className="text-base font-semibold">
                        Google Play
                      </span>
                    </span>
                  </a>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div
                  aria-hidden="true"
                  className="bg-bg/10 absolute inset-x-0 top-4 -bottom-4 rounded-t-3xl"
                />
                <Image
                  src={PHONE_IMAGE}
                  alt={co.cta22PhoneImageAlt}
                  width={216}
                  height={440}
                  className="relative h-auto w-40 rounded-t-3xl object-cover lg:w-44"
                />
              </div>
            </div>
          </div>
          <div className="border-border bg-surface-hover/50 hidden flex-col justify-center gap-5 rounded-3xl border p-8 sm:flex">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter"
            >
              {co.cta22NewsletterTitle}
            </Typography>
            <Typography variant="body" className="text-muted">
              {co.cta22NewsletterBody}
            </Typography>
            {submitted ? (
              <Typography variant="body" className="text-brand font-medium">
                {co.cta22NewsletterSuccess}
              </Typography>
            ) : (
              <form
                onSubmit={(e) => handleNewsletterSubmit(e, setSubmitted)}
                className="flex flex-col gap-3"
              >
                <Input
                  type="email"
                  name="email"
                  required
                  placeholder={co.cta22NewsletterPlaceholder}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  rightIcon={<IconArrowRight size={16} />}
                >
                  {co.cta22NewsletterButton}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
