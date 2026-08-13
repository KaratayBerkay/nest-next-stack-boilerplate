"use client";

import {
  IconArrowUpRight,
  IconFileCheck,
  IconLock,
  IconServer2,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

const LINK_URL = "#" as const;

const CERTIFICATIONS = [
  { name: "ISO 27001", icon: IconShieldCheck },
  { name: "GDPR", icon: IconFileCheck },
  { name: "CCPA", icon: IconLock },
  { name: "AICPA SOC", icon: IconServer2 },
] as const;

export function CertificationLogosDocs() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-muted text-xs font-semibold tracking-[0.2em] uppercase">
            {co.compliance8Eyebrow}
          </p>
          <h2 className="text-fg text-3xl font-bold tracking-tight md:text-5xl">
            {co.compliance8Title}
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            {co.compliance8Description}
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
          {CERTIFICATIONS.map((cert) => {
            const CertIcon = cert.icon;
            return (
              <div
                key={cert.name}
                className="border-border bg-surface flex flex-col items-center gap-3 rounded-xl border p-6"
              >
                <div className="border-border bg-surface-hover rounded-lg border p-2.5">
                  <CertIcon className="text-brand size-5" />
                </div>
                <span className="text-fg font-mono text-xs font-semibold">
                  {cert.name}
                </span>
              </div>
            );
          })}
        </div>
        <Button variant="primary" size="lg" asChild>
          <a href={LINK_URL}>
            {co.compliance8DocsButton}
            <IconArrowUpRight className="size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
