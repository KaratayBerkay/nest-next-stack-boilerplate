"use client";

import {
  IconBell,
  IconBox,
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

type SectionLabelKey = "s3NavProducts" | "s3NavCompany" | "s3NavResources";

type ItemLabelKey =
  | "s3ProductAnalytics"
  | "s3ProductAutomations"
  | "s3ProductIntegrations"
  | "s3CompanyAbout"
  | "s3CompanyCareers"
  | "s3CompanyPress"
  | "s3ResourceDocs"
  | "s3ResourceHelp"
  | "s3ResourceCommunity";

interface TopNavSection {
  labelKey: SectionLabelKey;
  items: { labelKey: ItemLabelKey }[];
}

const TOP_NAV_SECTIONS: TopNavSection[] = [
  {
    labelKey: "s3NavProducts",
    items: [
      { labelKey: "s3ProductAnalytics" },
      { labelKey: "s3ProductAutomations" },
      { labelKey: "s3ProductIntegrations" },
    ],
  },
  {
    labelKey: "s3NavCompany",
    items: [
      { labelKey: "s3CompanyAbout" },
      { labelKey: "s3CompanyCareers" },
      { labelKey: "s3CompanyPress" },
    ],
  },
  {
    labelKey: "s3NavResources",
    items: [
      { labelKey: "s3ResourceDocs" },
      { labelKey: "s3ResourceHelp" },
      { labelKey: "s3ResourceCommunity" },
    ],
  },
];

const FEATURE_CARDS = [
  { titleKey: "s3Card1Title", bodyKey: "s3Card1Body" },
  { titleKey: "s3Card2Title", bodyKey: "s3Card2Body" },
  { titleKey: "s3Card3Title", bodyKey: "s3Card3Body" },
  { titleKey: "s3Card4Title", bodyKey: "s3Card4Body" },
] as const;

const USER = { name: "Sarah Chen", emailKey: "s3UserEmail" } as const;

function BrandMark() {
  return (
    <div className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
      <IconBox size={18} className="text-brand-fg" />
    </div>
  );
}

function UserMenu() {
  const t = useMessages("pages").applicationShell;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-3 px-2">
          <Avatar size="md" variant="brand" fallback={USER.name} />
          <span className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium">{USER.name}</span>
            <span className="text-muted text-xs">{t[USER.emailKey]}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-fg text-sm font-medium">{USER.name}</span>
          <span className="text-muted text-xs">{t[USER.emailKey]}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <IconUser size={16} />
          {t.s3MenuAccount}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <IconLogout size={16} />
          {t.s3MenuSignOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WithTopNav() {
  const t = useMessages("pages").applicationShell;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="border-border bg-surface flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <header className="bg-surface border-border sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b px-4">
              <div className="flex items-center gap-2">
                <BrandMark />
                <Typography
                  variant="bodyLarge"
                  className="hidden font-semibold sm:block"
                >
                  {t.s3LogoName}
                </Typography>
              </div>

              <div className="hidden items-center gap-1 lg:flex">
                {TOP_NAV_SECTIONS.map((section) => (
                  <DropdownMenu key={section.labelKey}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-1.5">
                        {t[section.labelKey]}
                        <IconChevronDown size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      {section.items.map((item) => (
                        <DropdownMenuItem key={item.labelKey} className="gap-2">
                          {t[item.labelKey]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Input
                  leftIcon={<IconSearch size={16} />}
                  placeholder={t.s3SearchPlaceholder}
                  className="hidden w-56 md:block"
                />

                <Tooltip side="bottom">
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t.s3BellTooltip}
                    >
                      <IconBell size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t.s3BellTooltip}</TooltipContent>
                </Tooltip>

                <div className="hidden md:block">
                  <UserMenu />
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      aria-label={t.s3SheetTitle}
                    >
                      <IconMenu2 size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="flex flex-col">
                    <SheetHeader className="text-left">
                      <SheetTitle className="flex items-center gap-2">
                        <BrandMark />
                        <span className="text-base">{t.s3LogoName}</span>
                      </SheetTitle>
                    </SheetHeader>
                    <Input
                      leftIcon={<IconSearch size={16} />}
                      placeholder={t.s3SearchPlaceholder}
                    />
                    <div className="flex flex-col gap-4">
                      {TOP_NAV_SECTIONS.map((section) => (
                        <div
                          key={section.labelKey}
                          className="flex flex-col gap-1"
                        >
                          <Typography variant="overline">
                            {t[section.labelKey]}
                          </Typography>
                          {section.items.map((item) => (
                            <button
                              key={item.labelKey}
                              type="button"
                              className="text-muted hover:text-fg hover:bg-surface-hover h-9 w-full rounded-lg px-2 text-left text-sm transition-colors"
                            >
                              {t[item.labelKey]}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </header>

            <main className="flex flex-col gap-6 p-6">
              <div className="flex flex-col gap-1">
                <Typography
                  variant="h2"
                  className="text-2xl font-medium tracking-tight"
                >
                  {t.s3Heading}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {t.s3Description}
                </Typography>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {FEATURE_CARDS.map((card) => (
                  <Card key={card.titleKey} className="overflow-hidden">
                    <Skeleton className="h-40 w-full rounded-none" />
                    <div className="flex flex-col gap-2 p-5">
                      <Typography
                        variant="h3"
                        className="text-lg font-medium tracking-tight"
                      >
                        {t[card.titleKey]}
                      </Typography>
                      <Typography variant="body" className="text-muted">
                        {t[card.bodyKey]}
                      </Typography>
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
