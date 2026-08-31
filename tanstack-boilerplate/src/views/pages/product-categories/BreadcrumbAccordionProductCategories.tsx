"use client";

import { useState } from "react";
import {
  IconArmchair,
  IconBallFootball,
  IconChevronRight,
  IconDeviceLaptop,
  IconShirt,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductCategoriesMessages } from "@/types/pages/product-categories/ProductCategoriesMessages-types";

interface Subcategory {
  id: string;
  nameKey: string;
  count: number;
}

interface ParentCategory {
  id: string;
  nameKey: string;
  icon: typeof IconDeviceLaptop;
  subcategories: Subcategory[];
}

const CATEGORIES: ParentCategory[] = [
  {
    id: "electronics",
    nameKey: "productCategories3Parent1Name",
    icon: IconDeviceLaptop,
    subcategories: [
      { id: "laptops", nameKey: "productCategories3Parent1Sub1Name", count: 214 },
      { id: "phones", nameKey: "productCategories3Parent1Sub2Name", count: 356 },
      { id: "audio", nameKey: "productCategories3Parent1Sub3Name", count: 128 },
    ],
  },
  {
    id: "fashion",
    nameKey: "productCategories3Parent2Name",
    icon: IconShirt,
    subcategories: [
      { id: "women", nameKey: "productCategories3Parent2Sub1Name", count: 1240 },
      { id: "men", nameKey: "productCategories3Parent2Sub2Name", count: 860 },
      { id: "shoes-bags", nameKey: "productCategories3Parent2Sub3Name", count: 512 },
    ],
  },
  {
    id: "home",
    nameKey: "productCategories3Parent3Name",
    icon: IconArmchair,
    subcategories: [
      { id: "furniture", nameKey: "productCategories3Parent3Sub1Name", count: 340 },
      { id: "kitchen", nameKey: "productCategories3Parent3Sub2Name", count: 275 },
      { id: "decor", nameKey: "productCategories3Parent3Sub3Name", count: 190 },
    ],
  },
  {
    id: "sports",
    nameKey: "productCategories3Parent4Name",
    icon: IconBallFootball,
    subcategories: [
      { id: "fitness", nameKey: "productCategories3Parent4Sub1Name", count: 165 },
      { id: "camping", nameKey: "productCategories3Parent4Sub2Name", count: 98 },
      { id: "cycling", nameKey: "productCategories3Parent4Sub3Name", count: 74 },
    ],
  },
];

export function BreadcrumbAccordionProductCategories() {
  const t = useMessages("pages") as unknown as PagesWithProductCategoriesMessages;
  const pc = t.productCategories;

  const [activeParentId, setActiveParentId] = useState<string>(CATEGORIES[0].id);
  const [activeSubId, setActiveSubId] = useState<string>(
    CATEGORIES[0].subcategories[0].id,
  );

  const activeParent =
    CATEGORIES.find((parent) => parent.id === activeParentId) ?? CATEGORIES[0];
  const activeSub =
    activeParent.subcategories.find((sub) => sub.id === activeSubId) ??
    activeParent.subcategories[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {pc.productCategories3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pc.productCategories3Heading}
          </h2>
          <p className="text-muted">{pc.productCategories3Description}</p>
        </div>

        <nav
          aria-label={pc.productCategories3BreadcrumbAriaLabel}
          className="text-muted mt-8 flex items-center gap-1.5 text-sm"
        >
          <span>{pc.productCategories3BreadcrumbHome}</span>
          <IconChevronRight size={14} aria-hidden="true" />
          <span className="text-fg font-medium">{pc[activeParent.nameKey]}</span>
          <IconChevronRight size={14} aria-hidden="true" />
          <span className="text-brand font-medium">{pc[activeSub.nameKey]}</span>
        </nav>

        <div className="border-border bg-surface mt-4 overflow-hidden rounded-2xl border">
          <Accordion
            type="single"
            defaultValue={CATEGORIES[0].id}
            onValueChange={(value) => {
              if (value) setActiveParentId(value);
            }}
          >
            {CATEGORIES.map((parent) => (
              <AccordionItem key={parent.id} value={parent.id}>
                <AccordionTrigger>
                  <span className="flex items-center gap-3">
                    <span className="bg-muted/15 text-fg flex size-9 items-center justify-center rounded-xl">
                      <parent.icon size={16} aria-hidden="true" />
                    </span>
                    {pc[parent.nameKey]}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {parent.subcategories.map((sub) => {
                      const isActive =
                        parent.id === activeParentId && sub.id === activeSubId;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setActiveParentId(parent.id);
                            setActiveSubId(sub.id);
                          }}
                          className={
                            isActive
                              ? "bg-brand text-brand-fg inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                              : "border-border text-fg hover:bg-surface-hover inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                          }
                        >
                          {pc[sub.nameKey]}
                          <span
                            className={
                              isActive ? "text-brand-fg/80" : "text-muted"
                            }
                          >
                            {sub.count} {pc.productCategories3ItemsSuffix}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
