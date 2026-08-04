"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  hasSession,
  encryptForServer,
  decryptFromServer,
  type WireEnvelopeV2,
} from "@/lib/crypto/session";

function subscribe(callback: () => void): () => void {
  window.addEventListener("session-crypto-change", callback);
  return () => window.removeEventListener("session-crypto-change", callback);
}

export function useSessionCrypto() {
  const active = useSyncExternalStore(
    subscribe,
    () => hasSession(),
    () => false,
  );

  const encrypt = useCallback(
    (payload: unknown): WireEnvelopeV2 => encryptForServer(payload),
    [],
  );

  const decrypt = useCallback(
    (envelope: WireEnvelopeV2): unknown => decryptFromServer(envelope),
    [],
  );

  return {
    active,
    encrypt,
    decrypt,
  };
}
