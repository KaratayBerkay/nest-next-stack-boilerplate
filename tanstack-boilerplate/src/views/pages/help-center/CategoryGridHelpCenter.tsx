"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { IconProps } from "@tabler/icons-react";
import {
  IconArrowRight,
  IconBrandSlack,
  IconChecklist,
  IconCode,
  IconCreditCard,
  IconKey,
  IconLifebuoy,
  IconPlugConnected,
  IconReceipt2,
  IconRefresh,
  IconRocket,
  IconShieldLock,
  IconTerminal2,
  IconTool,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHelpCenterMessages } from "@/types/pages/help-center/HelpCenterMessages-types";

interface HelpCategory {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
  descriptionKey: string;
  countKey: string;
}

const CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    icon: IconRocket,
    titleKey: "helpCenter1Category1Title",
    descriptionKey: "helpCenter1Category1Description",
    countKey: "helpCenter1Category1Count",
  },
  {
    id: "account-billing",
    icon: IconCreditCard,
    titleKey: "helpCenter1Category2Title",
    descriptionKey: "helpCenter1Category2Description",
    countKey: "helpCenter1Category2Count",
  },
  {
    id: "security-privacy",
    icon: IconShieldLock,
    titleKey: "helpCenter1Category3Title",
    descriptionKey: "helpCenter1Category3Description",
    countKey: "helpCenter1Category3Count",
  },
  {
    id: "integrations",
    icon: IconPlugConnected,
    titleKey: "helpCenter1Category4Title",
    descriptionKey: "helpCenter1Category4Description",
    countKey: "helpCenter1Category4Count",
  },
  {
    id: "api-developers",
    icon: IconCode,
    titleKey: "helpCenter1Category5Title",
    descriptionKey: "helpCenter1Category5Description",
    countKey: "helpCenter1Category5Count",
  },
  {
    id: "troubleshooting",
    icon: IconTool,
    titleKey: "helpCenter1Category6Title",
    descriptionKey: "helpCenter1Category6Description",
    countKey: "helpCenter1Category6Count",
  },
];

interface PopularArticle {
  id: string;
  categoryId: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
}

const POPULAR_ARTICLES: PopularArticle[] = [
  {
    id: "first-workspace",
    categoryId: "getting-started",
    icon: IconChecklist,
    titleKey: "helpCenter1Article1Title",
  },
  {
    id: "payment-method",
    categoryId: "account-billing",
    icon: IconReceipt2,
    titleKey: "helpCenter1Article2Title",
  },
  {
    id: "reset-password",
    categoryId: "security-privacy",
    icon: IconKey,
    titleKey: "helpCenter1Article3Title",
  },
  {
    id: "connect-slack",
    categoryId: "integrations",
    icon: IconBrandSlack,
    titleKey: "helpCenter1Article4Title",
  },
  {
    id: "first-api-key",
    categoryId: "api-developers",
    icon: IconTerminal2,
    titleKey: "helpCenter1Article5Title",
  },
  {
    id: "fix-sync",
    categoryId: "troubleshooting",
    icon: IconRefresh,
    titleKey: "helpCenter1Article6Title",
  },
];

const cardBaseClasses =
  "flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none";

export function CategoryGridHelpCenter() {
  const t = useMessages("pages") as unknown as PagesWithHelpCenterMessages;
  const h = t.helpCenter;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visibleArticles = useMemo(
    () =>
      activeCategory
        ? POPULAR_ARTICLES.filter(
            (article) => article.categoryId === activeCategory,
          )
        : POPULAR_ARTICLES,
    [activeCategory],
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="soft" pill>
            {h.helpCenter1Badge}
          </Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {h.helpCenter1Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {h.helpCenter1Description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  setActiveCategory(isActive ? null : category.id)
                }
                className={
                  isActive
                    ? `${cardBaseClasses} border-brand bg-brand/5`
                    : `${cardBaseClasses} border-border bg-surface hover:bg-surface-hover`
                }
              >
                <span className="border-border bg-surface-hover/50 text-brand flex size-11 shrink-0 items-center justify-center rounded-xl border">
                  <Icon size={22} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-fg text-base font-semibold">
                    {h[category.titleKey]}
                  </span>
                  <span className="text-muted text-sm leading-relaxed">
                    {h[category.descriptionKey]}
                  </span>
                </span>
                <Badge variant="outline" size="sm">
                  {h[category.countKey]}
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-fg text-xl font-semibold">
              {h.helpCenter1PopularTitle}
            </h3>
            {activeCategory && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setActiveCategory(null)}
              >
                {h.helpCenter1ClearFilter}
              </Button>
            )}
          </div>
          <div className="border-border divide-border overflow-hidden rounded-2xl border divide-y">
            {visibleArticles.map((article) => {
              const Icon = article.icon;
              const category = CATEGORIES.find(
                (candidate) => candidate.id === article.categoryId,
              );
              return (
                <Link
                  key={article.id}
                  href="#"
                  className="hover:bg-surface-hover flex items-center gap-4 px-5 py-4 transition-colors"
                >
                  <Icon size={18} className="text-muted shrink-0" />
                  <span className="text-fg flex-1 text-sm font-medium">
                    {h[article.titleKey]}
                  </span>
                  {category && (
                    <span className="text-muted hidden text-xs sm:inline">
                      {h[category.titleKey]}
                    </span>
                  )}
                  <IconArrowRight size={16} className="text-muted shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-border bg-surface mt-16 flex flex-col items-center gap-5 rounded-3xl border p-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <span className="bg-brand/15 text-brand flex size-12 shrink-0 items-center justify-center rounded-full">
              <IconLifebuoy size={24} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-fg font-semibold">
                {h.helpCenter1ContactTitle}
              </span>
              <span className="text-muted text-sm">
                {h.helpCenter1ContactDescription}
              </span>
            </div>
          </div>
          <Button asChild variant="primary" size="md">
            <Link href="#">{h.helpCenter1ContactCta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
