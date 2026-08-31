"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/Drawer";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

export function CornerCardLinkDrawerCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-end justify-end overflow-hidden rounded-2xl border p-6">
      <div className="border-border bg-bg animate-fade-in-up flex w-full max-w-sm flex-col gap-3 rounded-xl border p-5 shadow-lg motion-reduce:animate-none">
        <p className="text-fg text-sm font-semibold">
          {c.cookieBanner7Heading}
        </p>
        <p className="text-muted text-sm">{c.cookieBanner7Body}</p>
        <Drawer>
          <DrawerTrigger className="text-brand w-fit text-left text-sm underline underline-offset-4 hover:no-underline">
            {c.cookieBanner7PolicyTrigger}
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto flex w-full max-w-md flex-col gap-4">
              <DrawerHeader>
                <DrawerTitle>{c.cookieBanner7DrawerTitle}</DrawerTitle>
                <DrawerDescription>{c.cookieBanner7DrawerBody}</DrawerDescription>
              </DrawerHeader>
              <p className="text-muted -mt-2 px-1 text-sm">
                {c.cookieBanner7DrawerBody2}
              </p>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button type="button" variant="primary">
                    {c.cookieBanner7DrawerClose}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner7Decline}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setVisible(false)}
          >
            {c.cookieBanner7Accept}
          </Button>
        </div>
      </div>
    </section>
  );
}
