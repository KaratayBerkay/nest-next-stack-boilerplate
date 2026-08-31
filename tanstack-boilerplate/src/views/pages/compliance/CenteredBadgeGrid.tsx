"use client";

import {
  IconArrowRight,
  IconLock,
  IconServer2,
  IconShieldCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

const LINK_URL = "#" as const;

interface Certification {
  icon: Icon;
  name: string;
}

const CERTIFICATIONS: Certification[] = [
  { icon: IconShieldCheck, name: "SOC 2" },
  { icon: IconShieldLock, name: "ISO 27001" },
  { icon: IconServer2, name: "CCPA" },
  { icon: IconLock, name: "GDPR" },
];

export function CenteredBadgeGrid() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compliance5Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.compliance5Description}
          </Typography>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert.name}
              className="border-border bg-surface flex items-center justify-center gap-2 rounded-xl border px-4 py-5"
            >
              <cert.icon size={20} aria-hidden="true" className="text-muted" />
              <span className="text-muted font-mono text-xs">{cert.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="primary" size="lg">
            <a href={LINK_URL}>
              {co.compliance5Cta}
              <IconArrowRight size={16} aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
