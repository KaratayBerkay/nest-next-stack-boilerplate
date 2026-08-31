"use client";

import { useState } from "react";
import {
  IconBrandApple,
  IconBrandMastercard,
  IconBrandPaypal,
  IconBrandVisa,
  IconCreditCardFilled,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPaymentMethodsMessages } from "@/types/pages/payment-methods/PaymentMethodsMessages-types";

interface GridMethod {
  id: string;
  icon: Icon;
  nameKey: string;
  maskedKey: string;
  detailKey: string;
}

const INITIAL_METHODS: GridMethod[] = [
  {
    id: "visa",
    icon: IconBrandVisa,
    nameKey: "paymentMethods2Card1Name",
    maskedKey: "paymentMethods2Card1Masked",
    detailKey: "paymentMethods2Card1Detail",
  },
  {
    id: "mastercard",
    icon: IconBrandMastercard,
    nameKey: "paymentMethods2Card2Name",
    maskedKey: "paymentMethods2Card2Masked",
    detailKey: "paymentMethods2Card2Detail",
  },
  {
    id: "virtual",
    icon: IconCreditCardFilled,
    nameKey: "paymentMethods2Card3Name",
    maskedKey: "paymentMethods2Card3Masked",
    detailKey: "paymentMethods2Card3Detail",
  },
];

const POOL_METHODS: GridMethod[] = [
  {
    id: "paypal",
    icon: IconBrandPaypal,
    nameKey: "paymentMethods2Card4Name",
    maskedKey: "paymentMethods2Card4Masked",
    detailKey: "paymentMethods2Card4Detail",
  },
  {
    id: "applepay",
    icon: IconBrandApple,
    nameKey: "paymentMethods2Card5Name",
    maskedKey: "paymentMethods2Card5Masked",
    detailKey: "paymentMethods2Card5Detail",
  },
];

export function DefaultHighlightGridPaymentMethods() {
  const t = useMessages("pages") as unknown as PagesWithPaymentMethodsMessages;
  const pm = t.paymentMethods;

  const [methods, setMethods] = useState<GridMethod[]>(INITIAL_METHODS);
  const [defaultId, setDefaultId] = useState<string>(INITIAL_METHODS[0].id);

  function removeMethod(id: string) {
    const next = methods.filter((method) => method.id !== id);
    setMethods(next);
    if (defaultId === id) {
      setDefaultId(next[0]?.id ?? "");
    }
  }

  const nextPoolMethod = POOL_METHODS.find(
    (method) => !methods.some((existing) => existing.id === method.id),
  );

  function addMethod() {
    if (!nextPoolMethod) return;
    setMethods((prev) => [...prev, nextPoolMethod]);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {pm.paymentMethods2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {pm.paymentMethods2Description}
          </Typography>
        </div>

        {methods.length === 0 && !nextPoolMethod ? (
          <div className="border-border flex flex-col items-center gap-2 rounded-2xl border border-dashed p-12 text-center">
            <p className="text-fg font-medium">{pm.paymentMethods2EmptyTitle}</p>
            <p className="text-muted text-sm">
              {pm.paymentMethods2EmptyDescription}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {methods.map((method) => {
              const isDefault = method.id === defaultId;
              const name = pm[method.nameKey];

              return (
                <div
                  key={method.id}
                  className={
                    isDefault
                      ? "bg-fg text-bg ring-brand ring-offset-bg flex flex-col gap-8 rounded-2xl p-5 shadow-md ring-2 ring-offset-2"
                      : "bg-fg text-bg flex flex-col gap-8 rounded-2xl p-5 shadow-md"
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <method.icon size={28} aria-hidden="true" />
                    <IconButton
                      icon={<IconX size={12} aria-hidden="true" />}
                      label={pm.paymentMethods2RemoveAria.replace(
                        "{name}",
                        name,
                      )}
                      variant="ghost"
                      size="icon-xs"
                      className="text-bg/70 hover:bg-bg/10 hover:text-bg"
                      onClick={() => removeMethod(method.id)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-lg tracking-widest">
                      {pm[method.maskedKey]}
                    </span>
                    <span className="text-bg/70 text-xs">
                      {pm[method.detailKey]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {name}
                    </span>
                    {isDefault ? (
                      <Badge variant="default" size="sm">
                        {pm.paymentMethods2DefaultBadge}
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDefaultId(method.id)}
                        className="text-bg/80 hover:text-bg shrink-0 text-xs font-medium underline-offset-2 hover:underline"
                      >
                        {pm.paymentMethods2MakeDefaultLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {nextPoolMethod && (
              <button
                type="button"
                onClick={addMethod}
                aria-label={pm.paymentMethods2AddAria}
                className="border-border text-muted hover:border-brand hover:text-fg flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 transition-colors"
              >
                <IconPlus size={22} aria-hidden="true" />
                <span className="text-sm font-medium">
                  {pm.paymentMethods2AddTileLabel}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
