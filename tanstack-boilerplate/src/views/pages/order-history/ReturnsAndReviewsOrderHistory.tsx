"use client";

import Image from "next/image";
import { useState } from "react";
import { IconStar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderHistoryMessages } from "@/types/pages/order-history/OrderHistoryMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type ReturnReason = "wrong-size" | "damaged" | "changed-mind";

type OrderHistoryMessages = PagesWithOrderHistoryMessages["orderHistory"];

interface OrderRef {
  id: string;
  numberKey: string;
  dateKey: string;
  productKey: string;
  reviewKey?: string;
  initialRating: number;
  seed: string;
}

interface ReviewOrder {
  id: string;
  number: string;
  date: string;
  product: string;
  review?: string;
  initialRating: number;
  seed: string;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

const REASONS: { value: ReturnReason; labelKey: string }[] = [
  { value: "wrong-size", labelKey: "orderHistory5ReasonSize" },
  { value: "damaged", labelKey: "orderHistory5ReasonDamaged" },
  { value: "changed-mind", labelKey: "orderHistory5ReasonChangedMind" },
];

const ORDER_REFS: OrderRef[] = [
  {
    id: "order-5-1",
    numberKey: "orderHistory5Order1Number",
    dateKey: "orderHistory5Order1Date",
    productKey: "orderHistory5Order1Product",
    reviewKey: "orderHistory5Order1Review",
    initialRating: 5,
    seed: "oh5-1",
  },
  {
    id: "order-5-2",
    numberKey: "orderHistory5Order2Number",
    dateKey: "orderHistory5Order2Date",
    productKey: "orderHistory5Order2Product",
    initialRating: 0,
    seed: "oh5-2",
  },
  {
    id: "order-5-3",
    numberKey: "orderHistory5Order3Number",
    dateKey: "orderHistory5Order3Date",
    productKey: "orderHistory5Order3Product",
    reviewKey: "orderHistory5Order3Review",
    initialRating: 4,
    seed: "oh5-3",
  },
  {
    id: "order-5-4",
    numberKey: "orderHistory5Order4Number",
    dateKey: "orderHistory5Order4Date",
    productKey: "orderHistory5Order4Product",
    initialRating: 0,
    seed: "oh5-4",
  },
];

function buildOrders(d: OrderHistoryMessages): ReviewOrder[] {
  return ORDER_REFS.map((ref) => ({
    id: ref.id,
    number: d[ref.numberKey],
    date: d[ref.dateKey],
    product: d[ref.productKey],
    review: ref.reviewKey ? d[ref.reviewKey] : undefined,
    initialRating: ref.initialRating,
    seed: ref.seed,
  }));
}

function StarRating({
  value,
  onRate,
  ariaTemplate,
}: {
  value: number;
  onRate?: (rating: number) => void;
  ariaTemplate: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {STAR_VALUES.map((n) => {
        const filled = n <= value;
        const star = (
          <IconStar
            size={onRate ? 20 : 16}
            className={filled ? "text-warning" : "text-border"}
            fill={filled ? "currentColor" : "none"}
          />
        );
        if (!onRate) {
          return (
            <span key={n} aria-hidden="true">
              {star}
            </span>
          );
        }
        const label = ariaTemplate
          .replace("{value}", String(n))
          .replace("{max}", "5");
        return (
          <button
            key={n}
            type="button"
            onClick={() => onRate(n)}
            aria-label={label}
            className="transition-transform hover:scale-110"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}

export function ReturnsAndReviewsOrderHistory() {
  const t = useMessages("pages") as unknown as PagesWithOrderHistoryMessages;
  const d = t.orderHistory;
  const orders = buildOrders(d);

  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    Object.fromEntries(orders.map((o) => [o.id, o.initialRating])),
  );
  const [reviewed, setReviewed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(orders.map((o) => [o.id, Boolean(o.review)])),
  );
  const [returned, setReturned] = useState<Record<string, boolean>>({});
  const [reasons, setReasons] = useState<Record<string, ReturnReason>>({});

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.orderHistory5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.orderHistory5Description}
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={placeholderImage(order.seed, "4x3")}
                  alt={d.orderHistory5ImageAlt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 p-4 lg:p-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-fg font-semibold">{order.product}</span>
                  <span className="text-muted text-xs">
                    {order.number} ·{" "}
                    {d.orderHistory5DeliveredOn.replace("{date}", order.date)}
                  </span>
                </div>

                {reviewed[order.id] ? (
                  <div className="flex flex-col gap-1.5">
                    <StarRating
                      value={ratings[order.id]}
                      ariaTemplate={d.orderHistory5StarAria}
                    />
                    <p className="text-muted text-sm">
                      {order.review ?? d.orderHistory5ThanksLabel}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium">
                      {d.orderHistory5RateLabel}
                    </span>
                    <StarRating
                      value={ratings[order.id]}
                      ariaTemplate={d.orderHistory5StarAria}
                      onRate={(n) =>
                        setRatings((current) => ({ ...current, [order.id]: n }))
                      }
                    />
                    {ratings[order.id] > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="self-start"
                        onClick={() =>
                          setReviewed((current) => ({
                            ...current,
                            [order.id]: true,
                          }))
                        }
                      >
                        {d.orderHistory5SubmitReview}
                      </Button>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  {returned[order.id] ? (
                    <Badge variant="secondary">
                      {d.orderHistory5ReturnedLabel}
                    </Badge>
                  ) : (
                    <Dialog>
                      <DialogTrigger variant="outline" size="sm">
                        {d.orderHistory5StartReturn}
                      </DialogTrigger>
                      <DialogContent
                        size="sm"
                        closeLabel={d.orderHistory5ReturnCloseAria}
                      >
                        <DialogHeader>
                          <DialogTitle>{d.orderHistory5ReturnTitle}</DialogTitle>
                          <DialogDescription>
                            {d.orderHistory5ReturnDescription.replace(
                              "{order}",
                              order.number,
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        <DialogBody className="flex flex-col gap-4">
                          <RadioGroup
                            value={reasons[order.id] ?? "wrong-size"}
                            onValueChange={(value) =>
                              setReasons((current) => ({
                                ...current,
                                [order.id]: value as ReturnReason,
                              }))
                            }
                          >
                            {REASONS.map((reason) => (
                              <label
                                key={reason.value}
                                htmlFor={`${order.id}-${reason.value}`}
                                className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm"
                              >
                                <RadioGroupItem
                                  value={reason.value}
                                  id={`${order.id}-${reason.value}`}
                                />
                                {d[reason.labelKey]}
                              </label>
                            ))}
                          </RadioGroup>
                          <Textarea
                            placeholder={d.orderHistory5DetailsPlaceholder}
                            rows={3}
                          />
                        </DialogBody>
                        <DialogFooter>
                          <DialogClose>{d.orderHistory5Cancel}</DialogClose>
                          <DialogClose
                            variant="primary"
                            onClick={() =>
                              setReturned((current) => ({
                                ...current,
                                [order.id]: true,
                              }))
                            }
                          >
                            {d.orderHistory5SubmitReturn}
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
