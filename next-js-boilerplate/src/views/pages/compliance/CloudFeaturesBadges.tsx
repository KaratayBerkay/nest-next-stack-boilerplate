"use client";

import {
  IconCloudLock,
  IconDatabase,
  IconFileCheck,
  IconHeadset,
  IconLock,
  IconPlugConnected,
  IconServer2,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

const FEATURES = [
  {
    icon: IconPlugConnected,
    labelKey: "compliance7Feature1Label",
    descriptionKey: "compliance7Feature1Description",
  },
  {
    icon: IconDatabase,
    labelKey: "compliance7Feature2Label",
    descriptionKey: "compliance7Feature2Description",
  },
  {
    icon: IconHeadset,
    labelKey: "compliance7Feature3Label",
    descriptionKey: "compliance7Feature3Description",
  },
] as const;

const CERTIFICATIONS = [
  { name: "SOC 2", icon: IconShieldCheck, statusKey: "compliance7Status1" },
  { name: "ISO 27001", icon: IconFileCheck, statusKey: "compliance7Status2" },
  { name: "GDPR", icon: IconLock, statusKey: "compliance7Status3" },
  { name: "HIPAA", icon: IconServer2, statusKey: "compliance7Status4" },
  { name: "PCI DSS", icon: IconCloudLock, statusKey: "compliance7Status5" },
] as const;

export function CloudFeaturesBadges() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-3xl font-bold tracking-tight md:text-4xl">
                {co.compliance7Title}
              </h2>
              <p className="text-muted text-lg leading-relaxed">
                {co.compliance7Description}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              {FEATURES.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div
                    key={feature.labelKey}
                    className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-6"
                  >
                    <div className="border-border bg-surface-hover w-fit rounded-lg border p-2">
                      <FeatureIcon className="text-brand size-5" />
                    </div>
                    <h3 className="text-fg text-base font-semibold">
                      {co[feature.labelKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {co[feature.descriptionKey]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-border bg-surface flex h-fit flex-col gap-4 rounded-2xl border p-8">
            <h3 className="text-fg text-lg font-semibold">
              {co.compliance7CertificationTitle}
            </h3>
            <div className="flex flex-col gap-3">
              {CERTIFICATIONS.map((cert) => {
                const CertIcon = cert.icon;
                return (
                  <div
                    key={cert.name}
                    className="border-border flex items-center justify-between gap-4 rounded-lg border border-dashed px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <CertIcon className="text-brand size-5" />
                      <span className="text-fg font-mono text-sm">
                        {cert.name}
                      </span>
                    </div>
                    <span className="text-muted border-border rounded-full border px-3 py-1 text-xs">
                      {co[cert.statusKey]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
