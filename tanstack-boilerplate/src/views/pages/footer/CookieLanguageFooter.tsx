"use client";

import { useState } from "react";
import Link from "next/link";
import { IconBrandGithub, IconBrandX, IconWorld } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/Drawer";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/Select";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const LANGUAGES = [
  { value: "en", labelKey: "footer18LangEn" },
  { value: "tr", labelKey: "footer18LangTr" },
  { value: "de", labelKey: "footer18LangDe" },
] as const;
const COLUMNS = [
  { id: "product", titleKey: "footer18ColProductTitle", linkKeys: ["footer18ColProductLink1", "footer18ColProductLink2"] },
  { id: "company", titleKey: "footer18ColCompanyTitle", linkKeys: ["footer18ColCompanyLink1", "footer18ColCompanyLink2"] },
] as const;

export function CookieLanguageFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;
  const [lang, setLang] = useState("en");

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-lg font-semibold tracking-tight">{f.footer18Logo}</span>
            <div className="flex gap-3">
              <Link href="#" aria-label={f.footer18Social1Aria} className="text-muted hover:text-fg">
                <IconBrandX size={18} aria-hidden="true" />
              </Link>
              <Link href="#" aria-label={f.footer18Social2Aria} className="text-muted hover:text-fg">
                <IconBrandGithub size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">{f[col.titleKey]}</span>
              <ul className="flex flex-col gap-2">
                {col.linkKeys.map((linkKey) => (
                  <li key={linkKey}>
                    <Link href="#" className="text-muted hover:text-fg text-sm">
                      {f[linkKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-2.5">
            <span className="text-fg text-sm font-semibold">{f.footer18SettingsTitle}</span>
            <Select value={lang} onValueChange={setLang} name="footer-18-lang">
              <SelectTrigger className="w-32">
                <IconWorld size={14} aria-hidden="true" className="mr-1" />
                {f[LANGUAGES.find((l) => l.value === lang)?.labelKey ?? "footer18LangEn"]}
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {f[option.labelKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Drawer>
              <DrawerTrigger className="text-muted hover:text-fg text-left text-sm">
                {f.footer18CookieTrigger}
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto flex w-full max-w-md flex-col gap-4">
                  <DrawerHeader>
                    <DrawerTitle>{f.footer18CookieHeading}</DrawerTitle>
                    <DrawerDescription>{f.footer18CookieBody}</DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <Button variant="primary">{f.footer18CookieAccept}</Button>
                    <Button variant="ghost">{f.footer18CookieReject}</Button>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
            <Dialog>
              <DialogTrigger variant="ghost" className="justify-start px-0 text-sm font-normal">
                {f.footer18PrivacyTrigger}
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{f.footer18PrivacyHeading}</DialogTitle>
                  <DialogDescription>{f.footer18PrivacyBody}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose variant="primary">{f.footer18PrivacyClose}</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="border-border mt-10 border-t pt-6">
          <span className="text-muted text-xs">{f.footer18Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
