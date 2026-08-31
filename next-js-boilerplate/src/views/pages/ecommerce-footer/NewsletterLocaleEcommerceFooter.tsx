"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceFooterMessages } from "@/types/pages/ecommerce-footer/EcommerceFooterMessages-types";

export function NewsletterLocaleEcommerceFooter() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceFooterMessages;
  const f = t.ecommerceFooter;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 2500);
  }

  return (
    <footer className="border-border bg-surface w-full border-t">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.ecommerceFooter1Brand}
            </span>
            <p className="text-muted text-sm">
              {f.ecommerceFooter1NewsletterCopy}
            </p>
            <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={f.ecommerceFooter1EmailPlaceholder}
                aria-label={f.ecommerceFooter1EmailPlaceholder}
                required
              />
              <Button type="submit" variant="primary" className="shrink-0">
                {subscribed
                  ? f.ecommerceFooter1Subscribed
                  : f.ecommerceFooter1SubscribeCta}
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-3 md:items-center">
            <span className="text-fg text-sm font-semibold">
              {f.ecommerceFooter1PreferencesTitle}
            </span>
            <div className="flex w-full max-w-56 flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ecommerce-footer-1-lang"
                  className="text-muted text-xs"
                >
                  {f.ecommerceFooter1LanguageLabel}
                </label>
                <NativeSelect id="ecommerce-footer-1-lang" defaultValue="en">
                  <option value="en">{f.ecommerceFooter1LangEnglish}</option>
                  <option value="tr">{f.ecommerceFooter1LangTurkish}</option>
                  <option value="de">{f.ecommerceFooter1LangGerman}</option>
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ecommerce-footer-1-currency"
                  className="text-muted text-xs"
                >
                  {f.ecommerceFooter1CurrencyLabel}
                </label>
                <NativeSelect
                  id="ecommerce-footer-1-currency"
                  defaultValue="usd"
                >
                  <option value="usd">{f.ecommerceFooter1CurrencyUsd}</option>
                  <option value="eur">{f.ecommerceFooter1CurrencyEur}</option>
                  <option value="gbp">{f.ecommerceFooter1CurrencyGbp}</option>
                </NativeSelect>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <span className="text-fg text-sm font-semibold">
              {f.ecommerceFooter1ContactTitle}
            </span>
            <a
              href={`mailto:${f.ecommerceFooter1Email}`}
              className="text-muted hover:text-fg flex items-center gap-2 text-sm"
            >
              <IconMail size={16} aria-hidden="true" />
              {f.ecommerceFooter1Email}
            </a>
            <a
              href={`tel:${f.ecommerceFooter1Phone}`}
              className="text-muted hover:text-fg flex items-center gap-2 text-sm"
            >
              <IconPhone size={16} aria-hidden="true" />
              {f.ecommerceFooter1Phone}
            </a>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="text-muted text-xs">
            {f.ecommerceFooter1Copyright}
          </span>
          <div className="flex gap-5">
            <Link href="#" className="text-muted hover:text-fg text-xs">
              {f.ecommerceFooter1Legal1}
            </Link>
            <Link href="#" className="text-muted hover:text-fg text-xs">
              {f.ecommerceFooter1Legal2}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
