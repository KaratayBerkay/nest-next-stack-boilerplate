"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconHeart,
  IconMessageCircle,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const IMAGE_SEED = "product-detail-7-headphones";

type TabValue = "description" | "specs" | "reviews";

interface SpecRow {
  labelKey: string;
  valueKey: string;
}

const SPEC_ROWS: SpecRow[] = [
  { labelKey: "productDetail7SpecRow1Label", valueKey: "productDetail7SpecRow1Value" },
  { labelKey: "productDetail7SpecRow2Label", valueKey: "productDetail7SpecRow2Value" },
  { labelKey: "productDetail7SpecRow3Label", valueKey: "productDetail7SpecRow3Value" },
];

interface ReviewItem {
  id: string;
  authorKey: string;
  ratingKey: string;
  bodyKey: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: "review-1",
    authorKey: "productDetail7Review1Author",
    ratingKey: "productDetail7Review1Rating",
    bodyKey: "productDetail7Review1Body",
  },
  {
    id: "review-2",
    authorKey: "productDetail7Review2Author",
    ratingKey: "productDetail7Review2Rating",
    bodyKey: "productDetail7Review2Body",
  },
];

export function TabbedDescriptionReviewsProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;
  const [activeTab, setActiveTab] = useState<TabValue>("description");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="border-border bg-surface relative aspect-square w-full overflow-hidden rounded-3xl border">
            <Image
              src={placeholderImage(IMAGE_SEED, "1x1")}
              alt={pd.productDetail7ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-fg text-3xl font-semibold tracking-tight">
                {pd.productDetail7Name}
              </h1>
              <div className="text-muted flex items-center gap-1.5 text-sm">
                <IconStar size={14} className="text-warning" fill="currentColor" aria-hidden="true" />
                <span className="text-fg font-medium">{pd.productDetail7RatingValue}</span>
                <span>{pd.productDetail7ReviewCount}</span>
              </div>
            </div>

            <span className="text-fg text-2xl font-semibold tracking-tight">
              {pd.productDetail7Price}
            </span>

            <p className="text-muted text-sm leading-relaxed">
              {pd.productDetail7Lead}
            </p>

            <div className="flex items-center gap-3">
              <Button variant="primary" size="lg" className="flex-1">
                <IconShoppingBag size={16} aria-hidden="true" />
                {pd.productDetail7AddToCart}
              </Button>
              <IconButton
                icon={<IconHeart size={18} aria-hidden="true" />}
                label={pd.productDetail7WishlistAria}
                variant="outline"
                size="icon"
              />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="description">{pd.productDetail7DescTabLabel}</TabsTrigger>
            <TabsTrigger value="specs">{pd.productDetail7SpecsTabLabel}</TabsTrigger>
            <TabsTrigger value="reviews">{pd.productDetail7ReviewsTabLabel}</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="flex flex-col gap-3 pt-6">
            <p className="text-muted text-sm leading-relaxed">
              {pd.productDetail7DescriptionBody}
            </p>
          </TabsContent>

          <TabsContent value="specs" className="pt-6">
            <dl className="flex flex-col gap-3">
              {SPEC_ROWS.map((row) => (
                <div
                  key={row.labelKey}
                  className="border-border flex items-center justify-between gap-4 border-b pb-3 text-sm last:border-b-0"
                >
                  <dt className="text-muted">{pd[row.labelKey]}</dt>
                  <dd className="text-fg font-medium">{pd[row.valueKey]}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>

          <TabsContent value="reviews" className="flex flex-col gap-5 pt-6">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="border-border flex flex-col gap-1.5 border-b pb-5 text-sm last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-fg font-medium">{pd[review.authorKey]}</span>
                  <div className="text-muted flex items-center gap-1.5">
                    <IconStar size={14} className="text-warning" fill="currentColor" aria-hidden="true" />
                    <span>{pd[review.ratingKey]}</span>
                  </div>
                </div>
                <p className="text-muted leading-relaxed">{pd[review.bodyKey]}</p>
              </div>
            ))}
            <span className="text-muted flex items-center gap-2 text-xs">
              <IconMessageCircle size={14} aria-hidden="true" />
              {pd.productDetail7ReviewsFootnote}
            </span>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
