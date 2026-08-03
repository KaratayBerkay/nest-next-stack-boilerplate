/**
 * Lazy E2EE identity hook — triggered on first mount of Messages or Chat Room pages.
 *
 * Generates or loads the device identity from IndexedDB, then registers the
 * public bundle with the server.  No plaintext ever leaves the browser — only
 * public keys and signatures are POSTed.
 *
 * §4 of the plan: "Identity generation is lazy, triggered on first mount of
 * useMessagesPage.ts (shared by all four DM tier views) and
 * ChatRoomBaseView.tsx (shared by all four room tier views)."
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ensureIdentity } from "@/lib/crypto/identity";
import { useRegisterBundle } from "@/api/client/e2ee/register-bundle";
import type { DeviceIdentity, DeviceBundle } from "@/lib/crypto/types";

const DEVICE_ID_KEY = "e2ee:deviceId";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server-side";
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = `device-${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

interface E2eeIdentityState {
  identity: DeviceIdentity | null;
  bundle: DeviceBundle | null;
  loading: boolean;
  error: string | null;
  registered: boolean;
}

export function useE2eeIdentity() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<E2eeIdentityState>({
    identity: null,
    bundle: null,
    loading: false,
    error: null,
    registered: false,
  });
  const registerMutation = useRegisterBundle();
  const initializedRef = useRef(false);
  const deviceIdRef = useRef<string | null>(null);

  const initialize = useCallback(async () => {
    if (!user?.id || initializedRef.current) return;
    initializedRef.current = true;

    // Stable per-browser device ID (persisted in localStorage)
    if (!deviceIdRef.current) {
      deviceIdRef.current = getOrCreateDeviceId();
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      // Ensure identity exists (generates if needed)
      const { identity, bundle, serverPrekeys } = await ensureIdentity(
        deviceIdRef.current,
      );

      // Register public bundle with the server
      await registerMutation.mutateAsync({
        bundle,
        oneTimePrekeys: serverPrekeys,
      });

      setState({
        identity,
        bundle,
        loading: false,
        error: null,
        registered: true,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialize E2EE";
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, [user?.id, registerMutation]);

  // Lazy initialization on mount
  useEffect(() => {
    if (!authLoading && user?.id) {
      initialize();
    }
  }, [authLoading, user?.id, initialize]);

  return {
    ...state,
    refresh: () => {
      initializedRef.current = false;
      initialize();
    },
  };
}
