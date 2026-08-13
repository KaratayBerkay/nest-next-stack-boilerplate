"use client";

import {
  IconFileCheck,
  IconFileReport,
  IconLock,
  IconServer2,
  IconShieldCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

interface Feature {
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
}

interface Certification {
  icon: Icon;
  name: string;
}

const FEATURES: Feature[] = [
  {
    icon: IconLock,
    titleKey: "compliance3Feature1Title",
    descriptionKey: "compliance3Feature1Description",
  },
  {
    icon: IconShieldCheck,
    titleKey: "compliance3Feature2Title",
    descriptionKey: "compliance3Feature2Description",
  },
  {
    icon: IconFileReport,
    titleKey: "compliance3Feature3Title",
    descriptionKey: "compliance3Feature3Description",
  },
];

const CERTIFICATIONS: Certification[] = [
  { icon: IconShieldLock, name: "ISO 27001" },
  { icon: IconShieldCheck, name: "SOC 2" },
  { icon: IconServer2, name: "GDPR" },
  { icon: IconFileCheck, name: "PCI DSS" },
];

export function SecurityPracticesBadges() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="border-brand/30 bg-brand/10 text-brand rounded-lg border px-3 py-1.5 text-sm font-medium">
            {co.compliance3Badge}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compliance3Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.compliance3Description}
          </Typography>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.titleKey}
                className="border-border bg-surface flex items-start gap-4 rounded-2xl border p-6"
              >
                <span className="border-border bg-bg flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-xs">
                  <feature.icon
                    size={22}
                    aria-hidden="true"
                    className="text-brand"
                  />
                </span>
                <div className="flex flex-col gap-1.5">
                  <Typography
                    variant="h5"
                    className="font-medium tracking-tight"
                  >
                    {co[feature.titleKey]}
                  </Typography>
                  <Typography
                    variant="bodySmall"
                    className="text-muted leading-relaxed"
                  >
                    {co[feature.descriptionKey]}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <Typography
              variant="overline"
              className="text-muted text-xs font-semibold tracking-widest"
            >
              {co.compliance3CertificationsTitle}
            </Typography>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.name}
                  className="border-border bg-surface flex flex-col items-start gap-4 rounded-2xl border p-6"
                >
                  <span className="border-border bg-bg flex size-12 items-center justify-center rounded-xl border shadow-xs">
                    <cert.icon
                      size={22}
                      aria-hidden="true"
                      className="text-muted"
                    />
                  </span>
                  <span className="text-muted font-mono text-sm">
                    {cert.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
