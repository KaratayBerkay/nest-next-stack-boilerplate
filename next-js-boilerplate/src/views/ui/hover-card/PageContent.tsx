"use client";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/HoverCard";
import { Avatar } from "@/components/ui/avatar";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "User Preview",
    description: "GitHub-style profile preview on hover.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <HoverCard>
            <HoverCardTrigger className="cursor-help text-sm underline">
              Hover me
            </HoverCardTrigger>
            <HoverCardContent>Content revealed on hover.</HoverCardContent>
          </HoverCard>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Link Preview",
    description: "Link with title, description, and domain preview.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">GitHub Profile Preview</h3>
          <HoverCard>
            <HoverCardTrigger className="cursor-pointer text-sm font-medium text-accent underline">
              @janedoe
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex gap-4">
                <Avatar
                  src="https://avatars.githubusercontent.com/u/583231?v=4"
                  alt="Jane Doe"
                  fallback="JD"
                  size="lg"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-fg text-sm font-semibold">Jane Doe</p>
                  <p className="text-muted text-xs">
                    Full-stack developer. Open-source enthusiast.
                  </p>
                  <div className="text-muted mt-1 flex gap-3 text-xs">
                    <span className="font-medium">2.4k followers</span>
                    <span className="font-medium">120 following</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Link Preview</h3>
          <HoverCard>
            <HoverCardTrigger className="cursor-pointer text-sm text-accent underline">
              https://nextjs.org/docs
            </HoverCardTrigger>
            <HoverCardContent className="flex w-80 flex-col gap-2">
              <p className="text-fg text-sm font-semibold">
                Next.js Documentation
              </p>
              <p className="text-muted text-xs leading-relaxed">
                Learn how to build fast and accessible web applications with
                Next.js — the React framework for production.
              </p>
              <div className="text-muted flex items-center gap-1.5 text-xs">
                <span className="flex size-4 items-center justify-center rounded bg-zinc-200 text-[10px] font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                  N
                </span>
                nextjs.org
              </div>
            </HoverCardContent>
          </HoverCard>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Code Repository</h3>
          <HoverCard>
            <HoverCardTrigger className="cursor-pointer text-sm text-accent underline">
              vercel/next.js
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    src="https://avatars.githubusercontent.com/u/14985020?s=48"
                    alt="Vercel"
                    fallback="V"
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-fg text-sm font-semibold">
                      vercel/next.js
                    </p>
                    <p className="text-muted text-xs">The React Framework</p>
                  </div>
                </div>
                <p className="text-muted text-xs leading-relaxed">
                  Next.js is a React framework for building full-stack web
                  applications. Stars: 128k, Forks: 27k.
                </p>
                <span className="border-border text-muted inline-flex w-fit items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]">
                  <span className="size-2 rounded-full bg-amber-400" />
                  TypeScript
                </span>
              </div>
            </HoverCardContent>
          </HoverCard>
        </section>
      </div>
    ),
  },
];

export default function HoverCardPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Hover Card"
      intro="A card that appears on hover."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
