"use client";

import {
  IconFileCheck,
  IconLock,
  IconServer2,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

const LATTICE = [
  { label: "ISO 27001", icon: IconShieldCheck },
  { label: "GDPR", icon: IconFileCheck },
  { label: "CCPA", icon: IconLock },
  { label: "AICPA SOC", icon: IconServer2 },
] as const;

const PILLARS = [
  {
    icon: IconShieldCheck,
    titleKey: "compliance6Pillar1Title",
    descriptionKey: "compliance6Pillar1Description",
  },
  {
    icon: IconLock,
    titleKey: "compliance6Pillar2Title",
    descriptionKey: "compliance6Pillar2Description",
  },
  {
    icon: IconUserCheck,
    titleKey: "compliance6Pillar3Title",
    descriptionKey: "compliance6Pillar3Description",
  },
] as const;

export function HeroCertificationLattice() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <span className="bg-brand h-1 w-12 rounded-full" />
            <p className="text-muted text-xs font-semibold tracking-[0.2em] uppercase">
              {co.compliance6Eyebrow}
            </p>
            <h1 className="text-fg text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {co.compliance6Title}
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              {co.compliance6Description}
            </p>
          </div>
          <div className="bg-border border-border grid grid-cols-2 gap-px overflow-hidden rounded-2xl border">
            {LATTICE.map((cell) => {
              const CellIcon = cell.icon;
              return (
                <div
                  key={cell.label}
                  className="bg-surface flex flex-col items-center gap-4 p-8"
                >
                  <div className="border-border bg-surface-hover rounded-xl border p-3">
                    <CellIcon className="text-brand size-6" />
                  </div>
                  <span className="text-muted text-xs font-semibold tracking-[0.2em] uppercase">
                    {cell.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-border mt-16 overflow-hidden rounded-3xl border lg:mt-24">
          <div className="bg-surface-hover hidden h-14 w-full md:block">
            <svg
              className="h-full w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g className="stroke-border" strokeWidth="1.5">
                {Array.from({ length: 14 }, (_, i) => (
                  <line key={i} x1={i * 96} y1="64" x2={i * 96 + 96} y2="0" />
                ))}
              </g>
            </svg>
          </div>
          <div className="bg-surface grid gap-px md:grid-cols-3">
            {PILLARS.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div key={pillar.titleKey} className="flex flex-col gap-3 p-8">
                  <PillarIcon className="text-brand size-6" />
                  <h3 className="text-fg text-lg font-semibold">
                    {co[pillar.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {co[pillar.descriptionKey]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
