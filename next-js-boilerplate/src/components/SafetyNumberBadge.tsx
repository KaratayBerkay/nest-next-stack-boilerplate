"use client";

import { useState, useEffect } from "react";
import { IconShieldCheck, IconShield } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { SafetyNumberModal } from "./SafetyNumberModal";
import { getSafetyNumber } from "@/lib/crypto/store";
import type { SafetyNumberBadgeProps } from "@/types/components/SafetyNumberModal-types";

export function SafetyNumberBadge({
  peerUserId,
  peerName,
  ownUserId,
  ownFingerprint,
  peerFingerprint,
}: SafetyNumberBadgeProps) {
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!peerUserId) return;
    let cancelled = false;

    async function check() {
      const stored = await getSafetyNumber(ownUserId, peerUserId);
      if (!cancelled) {
        setVerified(
          !!stored && (!peerFingerprint || stored === peerFingerprint),
        );
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [peerUserId, peerFingerprint, ownUserId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors",
          "hover:bg-surface-hover",
          "focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none",
          verified ? "text-success" : "text-muted",
        )}
        title={verified ? "Conversation verified" : "Verify safety number"}
      >
        {verified ? <IconShieldCheck size={14} /> : <IconShield size={14} />}
      </button>

      <SafetyNumberModal
        open={open}
        onOpenChange={setOpen}
        peerUserId={peerUserId}
        peerName={peerName}
        ownUserId={ownUserId}
        ownFingerprint={ownFingerprint}
        peerFingerprint={peerFingerprint}
      />
    </>
  );
}
