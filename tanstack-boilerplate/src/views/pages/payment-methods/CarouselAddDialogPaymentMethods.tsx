"use client";

import { useRef, useState } from "react";
import {
  IconBrandMastercard,
  IconBrandPaypal,
  IconBrandVisa,
  IconCreditCard,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPaymentMethodsMessages } from "@/types/pages/payment-methods/PaymentMethodsMessages-types";

interface CarouselMethod {
  id: string;
  icon: Icon;
  masked: string;
  detail: string;
}

const BRAND_OPTIONS = [
  { id: "visa", icon: IconBrandVisa, labelKey: "paymentMethods4BrandVisa" },
  {
    id: "mastercard",
    icon: IconBrandMastercard,
    labelKey: "paymentMethods4BrandMastercard",
  },
  {
    id: "paypal",
    icon: IconBrandPaypal,
    labelKey: "paymentMethods4BrandPaypal",
  },
] as const;

type BrandId = (typeof BRAND_OPTIONS)[number]["id"];

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CarouselAddDialogPaymentMethods() {
  const t = useMessages("pages") as unknown as PagesWithPaymentMethodsMessages;
  const pm = t.paymentMethods;

  const [methods, setMethods] = useState<CarouselMethod[]>(() => [
    {
      id: "visa",
      icon: IconBrandVisa,
      masked: pm.paymentMethods4Card1Masked,
      detail: pm.paymentMethods4Card1Detail,
    },
    {
      id: "mastercard",
      icon: IconBrandMastercard,
      masked: pm.paymentMethods4Card2Masked,
      detail: pm.paymentMethods4Card2Detail,
    },
    {
      id: "paypal",
      icon: IconBrandPaypal,
      masked: pm.paymentMethods4Card3Masked,
      detail: pm.paymentMethods4Card3Detail,
    },
  ]);
  const [defaultId, setDefaultId] = useState("visa");
  const nextId = useRef(0);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState<BrandId>("visa");
  const [last4, setLast4] = useState("");
  const [expiry, setExpiry] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  const isValid =
    name.trim().length > 0 &&
    last4.length === 4 &&
    (brand === "paypal" || expiry.length === 5);

  function removeMethod(id: string) {
    const next = methods.filter((method) => method.id !== id);
    setMethods(next);
    if (defaultId === id) {
      setDefaultId(next[0]?.id ?? "");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) return;

    const brandOption =
      BRAND_OPTIONS.find((option) => option.id === brand) ?? BRAND_OPTIONS[0];
    const id = `added-${nextId.current++}`;
    const masked = `${pm[brandOption.labelKey]} •••• ${last4}`;
    const detail =
      brand === "paypal"
        ? pm.paymentMethods4LinkedDetail
        : pm.paymentMethods4ExpiryDetailTemplate.replace("{expiry}", expiry);

    setMethods((prev) => [
      ...prev,
      { id, icon: brandOption.icon, masked, detail },
    ]);
    if (makeDefault) setDefaultId(id);

    setName("");
    setLast4("");
    setExpiry("");
    setBrand("visa");
    setMakeDefault(false);
    setOpen(false);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {pm.paymentMethods4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {pm.paymentMethods4Description}
          </Typography>
        </div>

        {methods.length === 0 && (
          <p className="text-muted text-sm">{pm.paymentMethods4EmptyHint}</p>
        )}

        <div className="flex gap-4 overflow-x-auto pb-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className="border-border bg-surface flex w-56 shrink-0 flex-col gap-4 rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <method.icon size={22} className="text-muted" aria-hidden="true" />
                <div className="flex items-center gap-1.5">
                  {method.id === defaultId && (
                    <Badge variant="soft" size="sm">
                      {pm.paymentMethods4DefaultBadge}
                    </Badge>
                  )}
                  <IconButton
                    icon={<IconTrash size={12} aria-hidden="true" />}
                    label={pm.paymentMethods4RemoveAria.replace(
                      "{name}",
                      method.masked,
                    )}
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted hover:text-error"
                    onClick={() => removeMethod(method.id)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-fg text-sm font-medium">
                  {method.masked}
                </span>
                <span className="text-muted text-xs">{method.detail}</span>
              </div>
            </div>
          ))}

          <div className="border-border text-muted flex w-56 shrink-0 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                variant="outline"
                size="icon-lg"
                aria-label={pm.paymentMethods4AddAria}
              >
                <IconPlus size={20} aria-hidden="true" />
              </DialogTrigger>
              <DialogContent size="md">
                <form
                  onSubmit={handleSubmit}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <DialogHeader>
                    <DialogTitle>{pm.paymentMethods4DialogTitle}</DialogTitle>
                    <DialogDescription>
                      {pm.paymentMethods4DialogDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pm4-name">
                        {pm.paymentMethods4NameLabel}
                      </Label>
                      <Input
                        id="pm4-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={pm.paymentMethods4NamePlaceholder}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-fg text-sm font-medium">
                        {pm.paymentMethods4BrandLabel}
                      </span>
                      <div className="flex gap-2">
                        {BRAND_OPTIONS.map((option) => {
                          const active = brand === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setBrand(option.id)}
                              aria-pressed={active}
                              className={
                                active
                                  ? "border-brand bg-brand/10 text-brand flex flex-1 flex-col items-center gap-1 rounded-lg border-2 p-3"
                                  : "border-border text-muted hover:border-brand/50 hover:text-fg flex flex-1 flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors"
                              }
                            >
                              <option.icon size={18} aria-hidden="true" />
                              <span className="text-xs font-medium">
                                {pm[option.labelKey]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pm4-last4">
                        {pm.paymentMethods4Last4Label}
                      </Label>
                      <Input
                        id="pm4-last4"
                        value={last4}
                        onChange={(event) =>
                          setLast4(
                            event.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        placeholder={pm.paymentMethods4Last4Placeholder}
                        description={pm.paymentMethods4Last4Description}
                        leftIcon={<IconCreditCard size={16} aria-hidden="true" />}
                        inputMode="numeric"
                        autoComplete="off"
                      />
                    </div>
                    {brand !== "paypal" && (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pm4-expiry">
                          {pm.paymentMethods4ExpiryLabel}
                        </Label>
                        <Input
                          id="pm4-expiry"
                          value={expiry}
                          onChange={(event) =>
                            setExpiry(formatExpiry(event.target.value))
                          }
                          placeholder={pm.paymentMethods4ExpiryPlaceholder}
                        />
                      </div>
                    )}
                    <Checkbox
                      label={pm.paymentMethods4DefaultCheckboxLabel}
                      checked={makeDefault}
                      onChange={(event) =>
                        setMakeDefault(event.target.checked)
                      }
                    />
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose type="button">
                      {pm.paymentMethods4CancelLabel}
                    </DialogClose>
                    <Button type="submit" variant="primary" disabled={!isValid}>
                      {pm.paymentMethods4SubmitLabel}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <span className="text-sm font-medium">
              {pm.paymentMethods4AddTileLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
