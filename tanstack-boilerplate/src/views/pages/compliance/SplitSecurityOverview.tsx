"use client";

import {
  IconArrowRight,
  IconDownload,
  IconFileCheck,
  IconLock,
  IconServer2,
  IconShieldCheck,
  IconShieldLock,
  IconUserShield,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

const LINK_URL = "#" as const;

interface Feature {
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
}

interface Certification {
  icon: Icon;
  name: string;
  descriptionKey: string;
}

const FEATURES: Feature[] = [
  {
    icon: IconLock,
    titleKey: "compliance4Feature1Title",
    descriptionKey: "compliance4Feature1Description",
  },
  {
    icon: IconUserShield,
    titleKey: "compliance4Feature2Title",
    descriptionKey: "compliance4Feature2Description",
  },
  {
    icon: IconShieldCheck,
    titleKey: "compliance4Feature3Title",
    descriptionKey: "compliance4Feature3Description",
  },
  {
    icon: IconWorld,
    titleKey: "compliance4Feature4Title",
    descriptionKey: "compliance4Feature4Description",
  },
];

const CERTIFICATIONS: Certification[] = [
  {
    icon: IconShieldLock,
    name: "ISO 27001",
    descriptionKey: "compliance4Cert1Description",
  },
  {
    icon: IconShieldCheck,
    name: "SOC 2 Type II",
    descriptionKey: "compliance4Cert2Description",
  },
  {
    icon: IconServer2,
    name: "GDPR",
    descriptionKey: "compliance4Cert3Description",
  },
  {
    icon: IconFileCheck,
    name: "CCPA",
    descriptionKey: "compliance4Cert4Description",
  },
];

export function SplitSecurityOverview() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <span className="border-border text-muted rounded-lg border px-3 py-1.5 text-sm">
              {co.compliance4Badge}
            </span>
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter lg:text-5xl"
            >
              {co.compliance4Title}
            </Typography>
            <Typography
              variant="bodyLarge"
              className="text-muted leading-relaxed"
            >
              {co.compliance4Description}
            </Typography>
            <div className="mt-2 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-5"
                >
                  <feature.icon
                    size={22}
                    aria-hidden="true"
                    className="text-brand"
                  />
                  <div className="flex flex-col gap-1">
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
          </div>
          <div className="flex flex-col gap-6">
            <Typography
              variant="overline"
              className="text-muted text-xs font-semibold tracking-widest"
            >
              {co.compliance4CertificationsTitle}
            </Typography>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.name}
                  className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6"
                >
                  <span className="border-border bg-bg flex size-12 items-center justify-center rounded-xl border shadow-xs">
                    <cert.icon
                      size={22}
                      aria-hidden="true"
                      className="text-muted"
                    />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-fg font-mono text-sm font-medium">
                      {cert.name}
                    </span>
                    <Typography
                      variant="bodySmall"
                      className="text-muted leading-relaxed"
                    >
                      {co[cert.descriptionKey]}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href={LINK_URL}>
                  {co.compliance4Cta}
                  <IconArrowRight size={16} aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="primary">
                <a href={LINK_URL}>
                  {co.compliance4CtaSecondary}
                  <IconDownload size={16} aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
