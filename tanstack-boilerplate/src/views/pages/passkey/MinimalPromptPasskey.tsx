"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { IconCircleCheck, IconFaceId } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPasskeyMessages } from "@/types/pages/passkey/PasskeyMessages-types";

type PasskeyVerifyStatus = "idle" | "verifying" | "verified";

function handleVerify(setStatus: Dispatch<SetStateAction<PasskeyVerifyStatus>>) {
  setStatus("verifying");
  setTimeout(() => {
    setStatus("verified");
  }, 900);
}

export function MinimalPromptPasskey() {
  const t = useMessages("pages") as unknown as PagesWithPasskeyMessages;
  const pk = t.passkey;

  const [status, setStatus] = useState<PasskeyVerifyStatus>("idle");

  return (
    <section className="w-full py-20 lg:py-28">
      <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-6 px-6 text-center">
        <Avatar fallback={pk.passkey2UserName} size="lg" variant="brand" />
        <div className="flex flex-col gap-1">
          <p className="text-fg text-sm font-medium">{pk.passkey2UserName}</p>
          <p className="text-muted text-xs">{pk.passkey2UserEmail}</p>
        </div>

        <div className="relative flex size-20 items-center justify-center">
          {status === "verifying" && (
            <span
              className="bg-brand/20 absolute inset-0 animate-ping rounded-full motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          <button
            type="button"
            onClick={() => handleVerify(setStatus)}
            disabled={status !== "idle"}
            aria-label={pk.passkey2ScanAria}
            className={cn(
              "relative flex size-16 items-center justify-center rounded-full border-2 transition-colors disabled:cursor-default",
              status === "verified"
                ? "border-success bg-success/10 text-success"
                : "border-brand/40 bg-surface text-brand hover:border-brand",
            )}
          >
            {status === "verifying" ? (
              <Spinner size="lg" />
            ) : status === "verified" ? (
              <IconCircleCheck size={28} aria-hidden="true" />
            ) : (
              <IconFaceId size={28} aria-hidden="true" />
            )}
          </button>
        </div>

        <p className="text-muted text-xs">
          {status === "verifying"
            ? pk.passkey2VerifyingHint
            : status === "verified"
              ? pk.passkey2VerifiedHint
              : pk.passkey2IdleHint}
        </p>

        {status === "verified" ? (
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-muted hover:text-fg text-xs underline underline-offset-4"
          >
            {pk.passkey2SwitchAccount}
          </button>
        ) : (
          <Link
            href="#"
            className="text-muted hover:text-fg text-xs underline underline-offset-4"
          >
            {pk.passkey2PasswordFallback}
          </Link>
        )}
      </div>
    </section>
  );
}
