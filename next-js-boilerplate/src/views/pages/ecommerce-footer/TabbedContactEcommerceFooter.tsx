"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  IconCheck,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceFooterMessages } from "@/types/pages/ecommerce-footer/EcommerceFooterMessages-types";

interface TabLink {
  id: string;
  labelKey: string;
}

interface LinkTab {
  id: string;
  titleKey: string;
  links: TabLink[];
}

const TABS: LinkTab[] = [
  {
    id: "shop",
    titleKey: "ecommerceFooter18TabShop",
    links: [
      { id: "women", labelKey: "ecommerceFooter18ShopLink1" },
      { id: "men", labelKey: "ecommerceFooter18ShopLink2" },
      { id: "accessories", labelKey: "ecommerceFooter18ShopLink3" },
    ],
  },
  {
    id: "help",
    titleKey: "ecommerceFooter18TabHelp",
    links: [
      { id: "shipping", labelKey: "ecommerceFooter18HelpLink1" },
      { id: "returns", labelKey: "ecommerceFooter18HelpLink2" },
      { id: "sizing", labelKey: "ecommerceFooter18HelpLink3" },
    ],
  },
  {
    id: "company",
    titleKey: "ecommerceFooter18TabCompany",
    links: [
      { id: "story", labelKey: "ecommerceFooter18CompanyLink1" },
      { id: "careers", labelKey: "ecommerceFooter18CompanyLink2" },
      { id: "press", labelKey: "ecommerceFooter18CompanyLink3" },
    ],
  },
];

export function TabbedContactEcommerceFooter() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceFooterMessages;
  const f = t.ecommerceFooter;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [smsUpdates, setSmsUpdates] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
  }

  return (
    <footer className="border-border bg-surface w-full border-t">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <Tabs defaultValue="shop">
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} variant="underline">
                  {f[tab.titleKey]}
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="pt-6">
                <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {tab.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href="#"
                        className="text-muted hover:text-fg text-sm"
                      >
                        {f[link.labelKey]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>

          <Card className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-2">
              <span className="text-fg text-sm font-semibold">
                {f.ecommerceFooter18NewsletterTitle}
              </span>
              {subscribed ? (
                <p className="text-muted flex items-center gap-2 text-sm">
                  <IconCheck
                    size={16}
                    className="text-success shrink-0"
                    aria-hidden="true"
                  />
                  {f.ecommerceFooter18NewsletterConfirmedCopy}
                </p>
              ) : (
                <>
                  <p className="text-muted text-sm">
                    {f.ecommerceFooter18NewsletterCopy}
                  </p>
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={f.ecommerceFooter18EmailPlaceholder}
                      aria-label={f.ecommerceFooter18EmailPlaceholder}
                      required
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      className="shrink-0"
                    >
                      {f.ecommerceFooter18SubscribeCta}
                    </Button>
                  </form>
                </>
              )}
            </div>

            <Switch
              id="ecommerce-footer-18-sms"
              label={f.ecommerceFooter18SmsToggleLabel}
              checked={smsUpdates}
              onChange={(event) => setSmsUpdates(event.target.checked)}
            />

            <Separator />

            <div className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">
                {f.ecommerceFooter18ContactTitle}
              </span>
              <span className="text-muted flex items-start gap-2 text-sm">
                <IconMapPin
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {f.ecommerceFooter18Address}
              </span>
              <a
                href={`tel:${f.ecommerceFooter18Phone}`}
                className="text-muted hover:text-fg flex items-center gap-2 text-sm"
              >
                <IconPhone size={16} className="shrink-0" aria-hidden="true" />
                {f.ecommerceFooter18Phone}
              </a>
              <a
                href={`mailto:${f.ecommerceFooter18Email}`}
                className="text-muted hover:text-fg flex items-center gap-2 text-sm"
              >
                <IconMail size={16} className="shrink-0" aria-hidden="true" />
                {f.ecommerceFooter18Email}
              </a>
            </div>
          </Card>
        </div>

        <Separator className="my-10" />
        <span className="text-muted text-xs">
          {f.ecommerceFooter18Copyright}
        </span>
      </div>
    </footer>
  );
}
