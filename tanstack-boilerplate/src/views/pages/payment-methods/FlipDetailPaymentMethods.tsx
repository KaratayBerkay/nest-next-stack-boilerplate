"use client";

import { useState } from "react";
import {
  IconBrandMastercard,
  IconBrandVisa,
  IconChevronLeft,
  IconChevronRight,
  IconCreditCardFilled,
  IconRefresh,
  IconRotate,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPaymentMethodsMessages } from "@/types/pages/payment-methods/PaymentMethodsMessages-types";

interface FlipMethod {
  id: string;
  icon: Icon;
  nameKey: string;
  maskedKey: string;
  expiryKey: string;
  billingKey: string;
}

const METHODS: FlipMethod[] = [
  {
    id: "visa",
    icon: IconBrandVisa,
    nameKey: "paymentMethods3Card1Name",
    maskedKey: "paymentMethods3Card1Masked",
    expiryKey: "paymentMethods3Card1Expiry",
    billingKey: "paymentMethods3Card1Billing",
  },
  {
    id: "mastercard",
    icon: IconBrandMastercard,
    nameKey: "paymentMethods3Card2Name",
    maskedKey: "paymentMethods3Card2Masked",
    expiryKey: "paymentMethods3Card2Expiry",
    billingKey: "paymentMethods3Card2Billing",
  },
  {
    id: "prepaid",
    icon: IconCreditCardFilled,
    nameKey: "paymentMethods3Card3Name",
    maskedKey: "paymentMethods3Card3Masked",
    expiryKey: "paymentMethods3Card3Expiry",
    billingKey: "paymentMethods3Card3Billing",
  },
];

export function FlipDetailPaymentMethods() {
  const t = useMessages("pages") as unknown as PagesWithPaymentMethodsMessages;
  const pm = t.paymentMethods;

  const [methods, setMethods] = useState<FlipMethod[]>(METHODS);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [defaultId, setDefaultId] = useState<string>(METHODS[0].id);

  const current = methods[index];

  function goPrev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + methods.length) % methods.length);
  }

  function goNext() {
    setFlipped(false);
    setIndex((i) => (i + 1) % methods.length);
  }

  function setCurrentDefault() {
    if (current) setDefaultId(current.id);
  }

  function removeCurrent() {
    if (!current) return;
    const removedId = current.id;
    const next = methods.filter((method) => method.id !== removedId);
    setMethods(next);
    setFlipped(false);
    setIndex((i) => (next.length === 0 ? 0 : Math.min(i, next.length - 1)));
    if (defaultId === removedId) {
      setDefaultId(next[0]?.id ?? "");
    }
  }

  function restoreAll() {
    setMethods(METHODS);
    setIndex(0);
    setFlipped(false);
    setDefaultId(METHODS[0].id);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {pm.paymentMethods3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {pm.paymentMethods3Description}
          </Typography>
        </div>

        {current ? (
          <>
            <div
              className="mx-auto w-full max-w-sm"
              style={{ perspective: "1600px" }}
            >
              <div
                className="relative aspect-[8/5] w-full"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.6s",
                }}
              >
                <div
                  className="bg-fg text-bg absolute inset-0 flex flex-col justify-between rounded-2xl p-6 shadow-lg"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <current.icon size={32} aria-hidden="true" />
                    {current.id === defaultId && (
                      <Badge variant="default" size="sm">
                        {pm.paymentMethods3DefaultBadge}
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-xl tracking-widest">
                    {pm[current.maskedKey]}
                  </span>
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-sm font-medium">
                      {pm[current.nameKey]}
                    </span>
                    <span className="text-bg/70 text-xs">
                      {pm[current.expiryKey]}
                    </span>
                  </div>
                </div>
                <div
                  className="bg-fg text-bg absolute inset-0 flex flex-col justify-between rounded-2xl p-6 shadow-lg"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-bg/70 text-xs">
                      {pm.paymentMethods3BillingLabel}
                    </span>
                    <span className="text-sm">{pm[current.billingKey]}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={setCurrentDefault}
                      disabled={current.id === defaultId}
                      className="bg-bg/10 hover:bg-bg/20 text-bg w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                    >
                      {current.id === defaultId
                        ? pm.paymentMethods3AlreadyDefaultLabel
                        : pm.paymentMethods3SetDefaultLabel}
                    </button>
                    <ConfirmDialog
                      title={pm.paymentMethods3ConfirmTitle}
                      description={pm.paymentMethods3ConfirmDescription.replace(
                        "{name}",
                        pm[current.maskedKey],
                      )}
                      confirmLabel={pm.paymentMethods3ConfirmConfirm}
                      cancelLabel={pm.paymentMethods3ConfirmCancel}
                      onConfirm={removeCurrent}
                    >
                      {(open) => (
                        <button
                          type="button"
                          onClick={open}
                          className="border-bg/30 text-bg hover:bg-bg/10 w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                        >
                          {pm.paymentMethods3RemoveLabel}
                        </button>
                      )}
                    </ConfirmDialog>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <IconButton
                icon={<IconChevronLeft size={16} aria-hidden="true" />}
                label={pm.paymentMethods3PrevAria}
                variant="outline"
                size="icon-sm"
                disabled={methods.length < 2}
                onClick={goPrev}
              />
              <Button variant="outline" size="sm" onClick={() => setFlipped((f) => !f)}>
                <IconRotate size={16} aria-hidden="true" />
                {pm.paymentMethods3FlipLabel}
              </Button>
              <IconButton
                icon={<IconChevronRight size={16} aria-hidden="true" />}
                label={pm.paymentMethods3NextAria}
                variant="outline"
                size="icon-sm"
                disabled={methods.length < 2}
                onClick={goNext}
              />
            </div>

            {methods.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                {methods.map((method, i) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setFlipped(false);
                      setIndex(i);
                    }}
                    aria-label={pm.paymentMethods3DotAria.replace(
                      "{n}",
                      String(i + 1),
                    )}
                    className={
                      i === index
                        ? "bg-brand size-2 rounded-full"
                        : "bg-border hover:bg-muted size-2 rounded-full transition-colors"
                    }
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="border-border mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
            <IconWallet size={28} className="text-muted" aria-hidden="true" />
            <p className="text-fg font-medium">{pm.paymentMethods3EmptyTitle}</p>
            <p className="text-muted text-sm">
              {pm.paymentMethods3EmptyDescription}
            </p>
            <Button variant="outline" size="sm" onClick={restoreAll}>
              <IconRefresh size={14} aria-hidden="true" />
              {pm.paymentMethods3RestoreLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
