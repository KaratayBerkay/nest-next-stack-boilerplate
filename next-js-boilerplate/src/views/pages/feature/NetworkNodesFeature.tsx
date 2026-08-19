"use client";

import {
  IconActivity,
  IconBolt,
  IconChartLine,
  IconCpu,
  IconDatabase,
  IconGlobe,
  IconPlug,
  IconRoute,
  IconServer,
  IconShieldCheck,
  IconStack2,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const NODES = [
  {
    labelKey: "feature250Node1Label",
    Icon: IconGlobe,
    positionClass: "left-1/2 top-[10%] -translate-x-1/2",
  },
  {
    labelKey: "feature250Node2Label",
    Icon: IconDatabase,
    positionClass: "left-[78%] top-[22%] -translate-x-1/2",
  },
  {
    labelKey: "feature250Node3Label",
    Icon: IconCpu,
    positionClass: "left-[90%] top-1/2 -translate-x-1/2 -translate-y-1/2",
  },
  {
    labelKey: "feature250Node4Label",
    Icon: IconBolt,
    positionClass: "left-[78%] top-[70%] -translate-x-1/2",
  },
  {
    labelKey: "feature250Node5Label",
    Icon: IconChartLine,
    positionClass: "left-1/2 top-[82%] -translate-x-1/2",
  },
  {
    labelKey: "feature250Node6Label",
    Icon: IconServer,
    positionClass: "left-[22%] top-[70%] -translate-x-1/2",
  },
  {
    labelKey: "feature250Node7Label",
    Icon: IconShieldCheck,
    positionClass: "left-[10%] top-1/2 -translate-x-1/2 -translate-y-1/2",
  },
  {
    labelKey: "feature250Node8Label",
    Icon: IconPlug,
    positionClass: "left-[22%] top-[22%] -translate-x-1/2",
  },
] as const;

const SUPPORT_CARDS = [
  {
    titleKey: "feature250Support1Title",
    bodyKey: "feature250Support1Body",
    Icon: IconRoute,
  },
  {
    titleKey: "feature250Support2Title",
    bodyKey: "feature250Support2Body",
    Icon: IconActivity,
  },
  {
    titleKey: "feature250Support3Title",
    bodyKey: "feature250Support3Body",
    Icon: IconStack2,
  },
] as const;

export function NetworkNodesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature250Heading}
          </h2>
          <p className="text-muted">{f.feature250Intro}</p>
        </div>
        <div className="border-border bg-surface relative mt-12 aspect-[16/10] overflow-hidden rounded-lg border">
          <div
            aria-hidden="true"
            className="border-border absolute inset-x-0 top-1/2 border-t border-dashed"
          />
          <div
            aria-hidden="true"
            className="border-border absolute inset-y-0 left-1/2 border-l border-dashed"
          />
          <div
            aria-hidden="true"
            className="border-border absolute top-1/2 left-1/2 h-[200%] -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-dashed"
          />
          <div
            aria-hidden="true"
            className="border-border absolute top-1/2 left-1/2 h-[200%] -translate-x-1/2 -translate-y-1/2 -rotate-45 border-l border-dashed"
          />
          <div
            aria-hidden="true"
            className="border-border absolute inset-[10%] rounded-full border border-dashed"
          />
          {NODES.map((node) => (
            <div
              key={node.labelKey}
              className={`absolute flex flex-col items-center gap-2 ${node.positionClass}`}
            >
              <span className="border-border bg-surface text-fg flex size-11 items-center justify-center rounded-full border shadow-sm md:size-14">
                <node.Icon size={20} aria-hidden="true" />
              </span>
              <span className="text-muted hidden text-xs font-medium md:block">
                {f[node.labelKey]}
              </span>
            </div>
          ))}
          <div className="bg-brand text-brand-fg absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md md:size-20">
            <IconServer size={28} aria-hidden="true" />
          </div>
          <div className="bg-bg border-border text-fg absolute top-[56%] left-1/2 hidden -translate-x-1/2 rounded-full border px-3 py-1 text-xs font-medium md:block">
            {f.feature250HubLabel}
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SUPPORT_CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-6"
            >
              <span className="bg-brand/10 text-brand flex size-9 items-center justify-center rounded-md">
                <card.Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[card.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
