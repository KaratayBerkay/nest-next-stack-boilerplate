"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowsLeftRight,
  IconBell,
  IconChartCandle,
  IconChevronDown,
  IconSearch,
  IconSend,
  IconSettings,
  IconStar,
  IconTrendingUp,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface TokenDescriptor {
  symbol: string;
  letter: string;
  hue: string;
}

interface FavoriteToken extends TokenDescriptor {
  price: string;
}

interface MarketAsset extends TokenDescriptor {
  name: string;
  price: string;
  change: string;
  up: boolean;
}

const NAV_TABS = [
  { key: "s14NavTrade", icon: IconArrowsLeftRight },
  { key: "s14NavMarkets", icon: IconChartCandle },
  { key: "s14NavWallet", icon: IconWallet },
] as const;

const BRAND_NAME = "Nexus";
const USER_NAME = "Maya Chen";
const USER_EMAIL = "maya@nexus.io";
const WALLET_ADDRESS = "0x3f1a…9c2e";
const WALLET_BALANCE = "$48,250.42";

const FAVORITES: FavoriteToken[] = [
  { symbol: "BTC", letter: "B", hue: "bg-amber-500", price: "$67,420.13" },
  { symbol: "ETH", letter: "E", hue: "bg-indigo-500", price: "$3,215.88" },
  { symbol: "SOL", letter: "S", hue: "bg-emerald-500", price: "$152.44" },
  { symbol: "DOGE", letter: "D", hue: "bg-orange-500", price: "$0.1582" },
];

const TOP_ASSETS: FavoriteToken[] = [
  { symbol: "BTC", letter: "B", hue: "bg-amber-500", price: "0.4123" },
  { symbol: "ETH", letter: "E", hue: "bg-indigo-500", price: "2.15" },
];

const MARKET_ASSETS: MarketAsset[] = [
  {
    symbol: "BTC",
    letter: "B",
    hue: "bg-amber-500",
    name: "Bitcoin",
    price: "$67,420.13",
    change: "+2.4%",
    up: true,
  },
  {
    symbol: "ETH",
    letter: "E",
    hue: "bg-indigo-500",
    name: "Ethereum",
    price: "$3,215.88",
    change: "+1.8%",
    up: true,
  },
  {
    symbol: "SOL",
    letter: "S",
    hue: "bg-emerald-500",
    name: "Solana",
    price: "$152.44",
    change: "-1.2%",
    up: false,
  },
  {
    symbol: "DOGE",
    letter: "D",
    hue: "bg-orange-500",
    name: "Dogecoin",
    price: "$0.1582",
    change: "+5.1%",
    up: true,
  },
  {
    symbol: "ADA",
    letter: "A",
    hue: "bg-sky-500",
    name: "Cardano",
    price: "$0.4621",
    change: "-0.8%",
    up: false,
  },
];

function handleBannerClose(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

function handleTabSelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function TokenMark({ token }: { token: TokenDescriptor }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
        token.hue,
      )}
    >
      {token.letter}
    </span>
  );
}

function WalletMenu({ t }: { t: Record<string, string> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden items-center gap-2 rounded-full sm:flex"
        >
          <span className="font-mono text-xs">{WALLET_ADDRESS}</span>
          <IconChevronDown size={14} className="text-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>
          <Badge variant="success" size="sm" pill>
            {t.s14WalletStatus}
          </Badge>
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          <Typography variant="caption" className="text-muted">
            {t.s14WalletTotal}
          </Typography>
          <Typography
            variant="h3"
            className="mt-1 text-xl font-medium tracking-tight"
          >
            {WALLET_BALANCE}
          </Typography>
        </div>
        <div className="flex gap-2 px-2 pb-2">
          <Button size="sm" className="flex-1 gap-1">
            <IconArrowsLeftRight size={14} />
            {t.s14WalletSwap}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1">
            <IconTrendingUp size={14} />
            {t.s14WalletBuy}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1">
            <IconSend size={14} />
            {t.s14WalletSend}
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 pb-2">
          <Typography variant="caption" className="text-muted">
            {t.s14WalletTopAssets}
          </Typography>
          <div className="mt-2 flex flex-col gap-2">
            {TOP_ASSETS.map((token) => (
              <div key={token.symbol} className="flex items-center gap-2">
                <TokenMark token={token} />
                <Typography variant="body" className="font-medium">
                  {token.symbol}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-muted ml-auto font-mono"
                >
                  {token.price}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FavoritesMenu({ t }: { t: Record<string, string> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.s14Favorites}
          className="text-muted"
        >
          <IconStar size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <div className="p-2">
          <Input
            type="search"
            placeholder={t.s14FavoritesSearch}
            className="h-8 rounded-lg"
            leftIcon={<IconSearch size={14} />}
          />
        </div>
        <DropdownMenuSeparator />
        {FAVORITES.map((token) => (
          <DropdownMenuItem key={token.symbol}>
            <div className="flex w-full items-center gap-2">
              <TokenMark token={token} />
              <span className="font-medium">{token.symbol}</span>
              <span className="text-muted ml-auto font-mono text-xs">
                {token.price}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationsMenu({ t }: { t: Record<string, string> }) {
  const items = [
    {
      textKey: "s14Notification1Text" as const,
      timeKey: "s14Notification1Time" as const,
      tone: "bg-success",
    },
    {
      textKey: "s14Notification2Text" as const,
      timeKey: "s14Notification2Time" as const,
      tone: "bg-warning",
    },
    {
      textKey: "s14Notification3Text" as const,
      timeKey: "s14Notification3Time" as const,
      tone: "bg-error",
    },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.s14Notifications}
          className="text-muted"
        >
          <IconBell size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>{t.s14NotificationsLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.textKey}
            className="flex items-start gap-3"
          >
            <span
              className={cn("mt-1.5 size-2 shrink-0 rounded-full", item.tone)}
            />
            <span className="flex flex-col gap-0.5">
              <Typography variant="body">{t[item.textKey]}</Typography>
              <Typography variant="caption" className="text-muted">
                {t[item.timeKey]}
              </Typography>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ t }: { t: Record<string, string> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-muted/60 flex items-center gap-2 rounded-full p-1 transition-colors"
        >
          <Avatar
            size="sm"
            src="https://picsum.photos/seed/shell14-user/64/64"
            alt={USER_NAME}
            fallback="MC"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>
          <Typography variant="body" className="font-medium">
            {USER_NAME}
          </Typography>
          <Typography variant="caption" className="text-muted">
            {USER_EMAIL}
          </Typography>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconSettings size={16} />
          <span>{t.s14Settings}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>{t.s14Logout}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WithCryptoExchange() {
  const t = useMessages("pages").applicationShell;
  const [activeTab, setActiveTab] = useState(1);
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border relative flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          {bannerVisible && (
            <div className="bg-muted/60 border-border flex items-center justify-between border-b px-4 py-2">
              <Typography variant="caption" className="text-muted">
                {t.s14Banner}
              </Typography>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={t.s14BannerClose}
                onClick={() => handleBannerClose(setBannerVisible)}
                className="text-muted"
              >
                <IconX size={14} />
              </Button>
            </div>
          )}

          <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <button type="button" className="flex items-center gap-2">
              <div className="bg-brand flex size-7 items-center justify-center rounded-lg">
                <span className="text-brand-fg text-xs font-bold">N</span>
              </div>
              <Typography
                variant="bodyLarge"
                className="hidden font-semibold sm:block"
              >
                {BRAND_NAME}
              </Typography>
            </button>

            <div className="bg-muted hidden flex-1 items-center justify-center gap-1 rounded-full p-1 md:flex">
              {NAV_TABS.map((tab, index) => {
                const TabIcon = tab.icon;
                const isActive = index === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabSelect(index, setActiveTab)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors",
                      isActive ? "bg-fg text-bg" : "text-muted hover:text-fg",
                    )}
                  >
                    <TabIcon size={16} />
                    {t[tab.key]}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-1 md:ml-0">
              <WalletMenu t={t} />
              <FavoritesMenu t={t} />
              <NotificationsMenu t={t} />
              <UserMenu t={t} />
            </div>
          </header>

          <main className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4 p-6 pb-24 md:pb-6">
                <Typography
                  variant="h3"
                  className="text-2xl font-medium tracking-tighter"
                >
                  {t.s14MarketsHeading}
                </Typography>

                <div className="border-border bg-bg overflow-hidden rounded-xl border">
                  <div className="bg-muted/60 border-border text-muted grid grid-cols-[1fr_auto_auto] gap-4 border-b px-4 py-2 text-xs font-medium">
                    <span>{t.s14ColAsset}</span>
                    <span className="w-28 text-right">{t.s14ColPrice}</span>
                    <span className="w-20 text-right">{t.s14ColChange}</span>
                  </div>
                  {MARKET_ASSETS.map((asset) => (
                    <div
                      key={asset.symbol}
                      className="border-border grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <TokenMark token={asset} />
                        <div className="flex flex-col">
                          <Typography variant="body" className="font-medium">
                            {asset.symbol}
                          </Typography>
                          <Typography variant="caption" className="text-muted">
                            {asset.name}
                          </Typography>
                        </div>
                      </div>
                      <Typography
                        variant="body"
                        className="w-28 text-right font-mono"
                      >
                        {asset.price}
                      </Typography>
                      <Typography
                        variant="body"
                        className={cn(
                          "w-20 text-right font-mono",
                          asset.up ? "text-success" : "text-error",
                        )}
                      >
                        {asset.change}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </main>

          <nav
            aria-label={t.s14BottomNav}
            className="bg-surface border-border absolute inset-x-4 bottom-4 flex items-center justify-around rounded-2xl border py-2 shadow-lg md:hidden"
          >
            {NAV_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = tab.key === "s14NavMarkets";
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-label={t[tab.key]}
                  aria-pressed={isActive}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-fg text-bg" : "text-muted",
                  )}
                >
                  <TabIcon size={20} />
                </button>
              );
            })}
            <button
              type="button"
              aria-label={t.s14NavProfile}
              className="text-muted flex size-10 items-center justify-center rounded-full"
            >
              <Avatar size="sm" fallback="MC" />
            </button>
          </nav>
        </div>
      </div>
    </section>
  );
}
