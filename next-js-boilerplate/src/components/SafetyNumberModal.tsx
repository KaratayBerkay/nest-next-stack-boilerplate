"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button/button";
import { IconShieldCheck, IconAlertTriangle } from "@tabler/icons-react";
import {
  formatFingerprint,
  computeUserFingerprint,
  computeDmSafetyNumber,
} from "@/lib/crypto/fingerprint";
import {
  getSafetyNumber,
  setSafetyNumber,
  getIdentity,
} from "@/lib/crypto/store";
import { fetchPeerIdentityKey } from "@/api/server/e2ee/peer-identity";
import type { SafetyNumberModalProps } from "@/types/components/SafetyNumberModal-types";

export function SafetyNumberModal({
  open,
  onOpenChange,
  peerUserId,
  peerName,
  ownUserId,
  ownFingerprint: ownFingerprintProp,
  peerFingerprint: peerFingerprintProp,
}: SafetyNumberModalProps) {
  const [verified, setVerified] = useState(false);
  const [changed, setChanged] = useState(false);
  const [ownFingerprint, setOwnFingerprint] = useState(
    ownFingerprintProp ?? null,
  );
  const [peerFingerprint, setPeerFingerprint] = useState(
    peerFingerprintProp ?? null,
  );

  // Fetch fingerprints if not provided as props
  useEffect(() => {
    if (!open || !peerUserId || !ownUserId) return;
    let cancelled = false;

    async function load() {
      // Own fingerprint from IndexedDB identity
      if (!ownFingerprintProp) {
        const identity = await getIdentity(ownUserId);
        if (cancelled || !identity) return;
        const own = computeUserFingerprint(
          ownUserId,
          identity.identitySigningKey,
        );
        if (!cancelled) setOwnFingerprint(own);
      }

      // Peer fingerprint from server
      if (!peerFingerprintProp) {
        const peerKey = await fetchPeerIdentityKey(peerUserId);
        if (cancelled || !peerKey) return;
        const peer = computeUserFingerprint(peerUserId, peerKey);
        if (!cancelled) setPeerFingerprint(peer);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, ownUserId, peerUserId, ownFingerprintProp, peerFingerprintProp]);

  const fingerprintA = ownFingerprintProp ?? ownFingerprint;
  const fingerprintB = peerFingerprintProp ?? peerFingerprint;

  const safetyNumber =
    fingerprintA && fingerprintB
      ? computeDmSafetyNumber(ownUserId, fingerprintA, peerUserId, fingerprintB)
      : null;

  const formattedNumber = safetyNumber ? formatFingerprint(safetyNumber) : "";

  const qrValue = safetyNumber
    ? `e2ee:safety:${ownUserId}:${peerUserId}:${safetyNumber}`
    : "";

  // Check verification state on mount
  useEffect(() => {
    if (!open || !peerUserId || !fingerprintB) return;
    let cancelled = false;

    async function check() {
      const stored = await getSafetyNumber(ownUserId, peerUserId);
      if (cancelled) return;

      if (!stored) {
        setVerified(false);
        setChanged(false);
      } else if (stored !== fingerprintB) {
        setVerified(false);
        setChanged(true);
      } else {
        setVerified(true);
        setChanged(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [open, ownUserId, peerUserId, fingerprintB]);

  const handleVerify = useCallback(async () => {
    if (!fingerprintB) return;
    await setSafetyNumber(ownUserId, peerUserId, fingerprintB);
    setVerified(true);
    setChanged(false);
  }, [ownUserId, peerUserId, fingerprintB]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Safety Number</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center gap-4">
          {!safetyNumber ? (
            <p className="text-muted text-center text-xs">
              Loading safety number...
            </p>
          ) : (
            <>
              {changed && (
                <div className="bg-warning/10 text-warning flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs">
                  <IconAlertTriangle size={16} className="shrink-0" />
                  <span>
                    Safety number has changed since last verification. The
                    peer&apos;s identity key may have been re-generated.
                  </span>
                </div>
              )}

              {verified && !changed && (
                <div className="bg-success/10 text-success flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs">
                  <IconShieldCheck size={16} className="shrink-0" />
                  <span>
                    Verified — this conversation&apos;s safety number is
                    confirmed.
                  </span>
                </div>
              )}

              <p className="text-muted text-center text-xs">
                Compare this number with <strong>{peerName}</strong> to verify
                your conversation is secure.
              </p>

              <QRCodeSVG
                value={qrValue}
                size={180}
                bgColor="transparent"
                fgColor="currentColor"
                className="text-fg"
              />

              <div className="bg-surface w-full rounded-lg px-4 py-3">
                <p className="text-muted mb-1 text-center text-[10px] tracking-wider uppercase">
                  Safety Number
                </p>
                <p className="text-fg text-center font-mono text-xs leading-relaxed break-all">
                  {formattedNumber}
                </p>
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          {safetyNumber && !verified ? (
            <Button onClick={handleVerify} variant="default" size="sm">
              Mark as Verified
            </Button>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="sm"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
