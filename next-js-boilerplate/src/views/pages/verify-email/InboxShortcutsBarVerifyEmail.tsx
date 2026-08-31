"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import {
  IconBrandGmail,
  IconBrandOffice,
  IconBrandYahoo,
  IconCircleCheck,
  IconInbox,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithVerifyEmailMessages } from "@/types/pages/verify-email/VerifyEmailMessages-types";

const PROVIDERS = [
  { icon: IconBrandGmail, ariaKey: "verifyEmail6OpenGmailAria" },
  { icon: IconBrandOffice, ariaKey: "verifyEmail6OpenOutlookAria" },
  { icon: IconBrandYahoo, ariaKey: "verifyEmail6OpenYahooAria" },
] as const;

function handleResend(setResent: Dispatch<SetStateAction<boolean>>) {
  setResent(true);
  setTimeout(() => setResent(false), 2000);
}

export function InboxShortcutsBarVerifyEmail() {
  const t = useMessages("pages") as unknown as PagesWithVerifyEmailMessages;
  const ve = t.verifyEmail;

  const [resent, setResent] = useState(false);

  return (
    <section className="border-border bg-surface w-full border-y py-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-3 px-6 sm:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-full">
            <IconInbox size={16} aria-hidden="true" />
          </span>
          <p className="text-fg text-sm">
            {ve.verifyEmail6Message}{" "}
            <span className="font-medium">{ve.verifyEmail6MaskedEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {PROVIDERS.map((provider) => (
              <Link
                key={provider.ariaKey}
                href="#"
                aria-label={ve[provider.ariaKey]}
                className="border-border bg-bg hover:bg-surface-hover text-muted hover:text-fg flex size-8 items-center justify-center rounded-full border transition-colors"
              >
                <provider.icon size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
          {resent ? (
            <span className="text-success flex items-center gap-1 text-xs font-medium">
              <IconCircleCheck size={13} aria-hidden="true" />
              {ve.verifyEmail6ResendConfirmed}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => handleResend(setResent)}
              className="text-brand text-xs font-medium hover:underline"
            >
              {ve.verifyEmail6ResendAction}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
