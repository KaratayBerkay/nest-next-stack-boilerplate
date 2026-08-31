"use client";

import {
  IconCertificate,
  IconCheck,
  IconCreditCard,
  IconShieldCheck,
  IconWorldCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTrustStripMessages } from "@/types/pages/trust-strip/TrustStripMessages-types";

const CERTIFICATIONS = [
  { id: "soc2", icon: IconShieldCheck, labelKey: "trustStrip3Cert1Label" },
  { id: "iso", icon: IconCertificate, labelKey: "trustStrip3Cert2Label" },
  { id: "gdpr", icon: IconWorldCheck, labelKey: "trustStrip3Cert3Label" },
  { id: "pci", icon: IconCreditCard, labelKey: "trustStrip3Cert4Label" },
] as const;

export function CertificationPillsTrustStrip() {
  const t = useMessages("pages") as unknown as PagesWithTrustStripMessages;
  const ts = t.trustStrip;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <h2 className="text-fg text-2xl font-semibold tracking-tight md:text-3xl">
          {ts.trustStrip3Heading}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CERTIFICATIONS.map((cert) => (
            <Badge
              key={cert.id}
              variant="soft"
              size="md"
              pill
              className="gap-1.5"
            >
              <cert.icon size={15} aria-hidden="true" />
              {ts[cert.labelKey]}
            </Badge>
          ))}
        </div>
        <p className="text-muted flex items-center gap-1.5 text-sm">
          <IconCheck size={15} aria-hidden="true" className="text-success" />
          {ts.trustStrip3Guarantee}
        </p>
      </div>
    </section>
  );
}
