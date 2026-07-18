"use client";
import { useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconShoppingBag,
  IconStarFilled,
} from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { GlobalVariant } from "@/components/ui/global-style-variants";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="transition-transform duration-200 group-data-[state=open]:rotate-180"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ReadMoreTab() {
  const [open, setOpen] = useState(false);

  return (
    <article className="bg-surface border-border max-w-md rounded-lg border p-5">
      <h3 className="text-fg text-base font-semibold">
        Why design tokens matter
      </h3>
      <p className="text-muted mt-2 text-sm">
        Design tokens are named values for color, spacing, and typography that
        keep a product visually consistent. Instead of hardcoding a hex value
        in fifty places, components reference a single token.
      </p>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent className="text-muted flex flex-col gap-2 text-sm">
          <p className="pt-2">
            When a brand refresh lands, you change the token once and every
            screen follows. Theming works the same way: light, dark, and any
            future theme simply remap the same token names to new values.
          </p>
          <p>
            Tokens also make review easier — a diff that says
            &quot;surface-hover&quot; communicates intent, while a raw hex
            value communicates nothing.
          </p>
        </CollapsibleContent>
        <CollapsibleTrigger className="text-brand mt-3 rounded-md text-sm font-medium hover:underline">
          {open ? "Show less" : "Read more"}
        </CollapsibleTrigger>
      </Collapsible>
    </article>
  );
}

const sidebarSections = [
  {
    key: "files",
    label: "Files",
    defaultOpen: true,
    items: [
      { name: "Documents", count: 24 },
      { name: "Images", count: 156 },
      { name: "Downloads", count: 8 },
    ],
  },
  {
    key: "teams",
    label: "Teams",
    defaultOpen: false,
    items: [
      { name: "Design", count: 6 },
      { name: "Engineering", count: 14 },
      { name: "Marketing", count: 4 },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    defaultOpen: true,
    items: [
      { name: "Profile", count: 0 },
      { name: "Security", count: 2 },
      { name: "Notifications", count: 0 },
    ],
  },
];

function SidebarGroupsTab() {
  const [openState, setOpenState] = useState<Record<string, boolean>>(
    Object.fromEntries(
      sidebarSections.map((s) => [s.key, s.defaultOpen]),
    ),
  );

  return (
    <div className="flex flex-col gap-4">
      <nav className="bg-surface border-border divide-border w-64 divide-y rounded-lg border">
        {sidebarSections.map((section) => (
          <Collapsible
            key={section.key}
            open={openState[section.key]}
            onOpenChange={(open) =>
              setOpenState((prev) => ({ ...prev, [section.key]: open }))
            }
          >
            <CollapsibleTrigger className="group text-fg flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
              <span>{section.label}</span>
              <Chevron />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col pb-1">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="text-muted hover:bg-surface-hover flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span>{item.name}</span>
                    {item.count > 0 && (
                      <span className="bg-surface-hover text-muted rounded-md px-1.5 py-0.5 text-xs">
                        {item.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
      <p className="text-muted ml-1 text-xs">
        {sidebarSections
          .map((s) => `${s.label}: ${openState[s.key] ? "open" : "closed"}`)
          .join(" | ")}
      </p>
    </div>
  );
}

const orderItems = [
  { name: "Wireless Keyboard", qty: 1, price: 49.0 },
  { name: "USB-C Hub", qty: 2, price: 24.5 },
  { name: "Laptop Stand", qty: 1, price: 32.0 },
];

function OrderSummaryTab() {
  const subtotal = orderItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const shipping = 4.99;
  const total = subtotal + shipping;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Checkout summary collapsed by default — the pattern mobile stores use
        to keep the payment form above the fold.
      </p>
      <Collapsible className="bg-surface border-border max-w-sm rounded-lg border">
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg px-4 py-3">
          <span className="text-fg flex items-center gap-2 text-sm font-medium">
            <IconShoppingBag className="size-4" aria-hidden="true" />
            Order summary
          </span>
          <span className="flex items-center gap-2">
            <span className="text-fg text-sm font-semibold">
              ${total.toFixed(2)}
            </span>
            <Chevron />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-border flex flex-col gap-2 border-t px-4 py-3 text-sm">
            {orderItems.map((item) => (
              <div
                key={item.name}
                className="text-muted flex items-center justify-between"
              >
                <span>
                  {item.name}
                  {item.qty > 1 && ` × ${item.qty}`}
                </span>
                <span>${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="text-muted border-border flex items-center justify-between border-t pt-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="text-muted flex items-center justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="text-fg flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function AdvancedSettingsTab() {
  return (
    <form
      className="bg-surface border-border flex max-w-md flex-col gap-4 rounded-lg border p-5"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="collapsible-project-name" className="text-fg text-sm font-medium">
          Project name
        </label>
        <Input id="collapsible-project-name" defaultValue="marketing-site" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="collapsible-project-url" className="text-fg text-sm font-medium">
          Production URL
        </label>
        <Input
          id="collapsible-project-url"
          type="url"
          defaultValue="https://example.com"
        />
      </div>

      <Collapsible>
        <CollapsibleTrigger className="group text-muted hover:text-fg flex items-center gap-2 rounded-md py-1 text-sm font-medium">
          <IconAdjustmentsHorizontal className="size-4" aria-hidden="true" />
          Advanced options
          <Chevron />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 pt-3">
            <Switch label="Enable edge caching" defaultChecked />
            <Switch label="Verbose build logs" />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="collapsible-webhook" className="text-fg text-sm font-medium">
                Deploy webhook
              </label>
              <Input
                id="collapsible-webhook"
                type="url"
                placeholder="https://hooks.example.com/deploy"
                description="Called after every successful deploy."
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div>
        <Button size="sm" type="submit">
          Save changes
        </Button>
      </div>
    </form>
  );
}

const starredRepos = [
  { name: "@radix-ui/primitives", stars: "16.2k" },
  { name: "@tanstack/query", stars: "44.8k" },
  { name: "@vercel/next.js", stars: "132k" },
  { name: "@tailwindlabs/tailwindcss", stars: "87.5k" },
];

function StarredReposTab() {
  const [firstRepo, ...moreRepos] = starredRepos;

  return (
    <Collapsible className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-fg text-sm">
          <span className="font-semibold">berkay</span> starred{" "}
          {starredRepos.length} repositories
        </span>
        <CollapsibleTrigger
          aria-label="Toggle repository list"
          className="group text-muted hover:text-fg rounded-md p-1"
        >
          <Chevron />
        </CollapsibleTrigger>
      </div>
      <div className="bg-surface border-border flex items-center justify-between rounded-md border px-4 py-2">
        <span className="text-fg text-sm">{firstRepo.name}</span>
        <span className="text-muted flex items-center gap-1 text-xs">
          <IconStarFilled className="text-warning size-3" aria-hidden="true" />
          {firstRepo.stars}
        </span>
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        {moreRepos.map((repo) => (
          <div
            key={repo.name}
            className="bg-surface border-border flex items-center justify-between rounded-md border px-4 py-2"
          >
            <span className="text-fg text-sm">{repo.name}</span>
            <span className="text-muted flex items-center gap-1 text-xs">
              <IconStarFilled
                className="text-warning size-3"
                aria-hidden="true"
              />
              {repo.stars}
            </span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

const examples: UIExample[] = [
  {
    id: "read-more",
    title: "Read More",
    description: "Article card that expands truncated paragraph content.",
    render: () => <ReadMoreTab />,
  },
  {
    id: "sidebar-groups",
    title: "Sidebar Groups",
    description: "Navigation sections with collapsible group headers.",
    render: () => <SidebarGroupsTab />,
  },
  {
    id: "order-summary",
    title: "Order Summary",
    description: "Checkout summary with line items behind a total row.",
    render: () => <OrderSummaryTab />,
  },
  {
    id: "advanced-settings",
    title: "Advanced Settings",
    description: "Form that hides rarely-used options until requested.",
    render: () => <AdvancedSettingsTab />,
  },
  {
    id: "starred-repos",
    title: "Show More List",
    description: "First item always visible, the rest behind a toggle.",
    render: () => <StarredReposTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "Trigger rendered in every global style variant.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <Collapsible defaultOpen>
            <CollapsibleTrigger
              variant={
                variant === "default" ? undefined : (variant as GlobalVariant)
              }
              className="group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
            >
              Details
              <Chevron />
            </CollapsibleTrigger>
            <CollapsibleContent className="text-muted px-3 py-1.5 text-xs">
              Collapsible content area.
            </CollapsibleContent>
          </Collapsible>
        )}
      />
    ),
  },
];

export default function CollapsiblePage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Collapsible"
      intro="An interactive component that expands/collapses a content region."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
