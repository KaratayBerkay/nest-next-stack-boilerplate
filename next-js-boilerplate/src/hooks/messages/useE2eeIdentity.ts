/**
 * Lazy E2EE identity hook — triggered on first mount of Messages or Chat Room pages.
 *
 * Generates or loads the device identity from IndexedDB, then registers the
 * public bundle with the server and verifies the server-side bundle status.
 * No plaintext ever leaves the browser — only public keys and signatures are
 * POSTed.
 *
 * Returns `ready: true` only when:
 *   - Auth is loaded
 *   - IndexedDB identity exists with valid private keys
 *   - Server-side bundle is registered and confirmed
 *
 * §4 of the plan: "Identity generation is lazy, triggered on first mount of
 * useMessagesPage.ts (shared by all four DM tier views) and
 * ChatRoomBaseView.tsx (shared by all four room tier views)."
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ensureIdentity } from "@/lib/crypto/identity";
import { getDeviceId } from "@/lib/crypto/chat";
import { useRegisterBundle } from "@/api/client/e2ee/register-bundle";
import { getBundleStatusServer } from "@/api/server/e2ee/bundle-status";
import type { DeviceIdentity, DeviceBundle } from "@/lib/crypto/types";

interface E2eeIdentityState {
  identity: DeviceIdentity | null;
  bundle: DeviceBundle | null;
  loading: boolean;
  error: string | null;
  registered: boolean;
  ready: boolean;
}

export function useE2eeIdentity() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<E2eeIdentityState>({
    identity: null,
    bundle: null,
    loading: false,
    error: null,
    registered: false,
    ready: false,
  });
  const registerMutation = useRegisterBundle();
  const initializedRef = useRef(false);
  const deviceIdRef = useRef<string | null>(null);

  const initialize = useCallback(async () => {
    if (!user?.id || initializedRef.current) return;
    initializedRef.current = true;

    // Stable per-(browser, account) device ID (persisted in localStorage)
    if (!deviceIdRef.current) {
      deviceIdRef.current = getDeviceId(user.id);
    }

    setState((s) => ({ ...s, loading: true, error: null, ready: false }));

    try {
      // Ensure identity exists (generates if needed)
      const { identity, bundle, serverPrekeys } = await ensureIdentity(
        user.id,
        deviceIdRef.current,
      );

      // Register public bundle with the server
      await registerMutation.mutateAsync({
        bundle,
        oneTimePrekeys: serverPrekeys,
      });

      // Verify the server actually has our bundle registered
      const status = await getBundleStatusServer(user.id);
      if (!status.registered) {
        // Server doesn't have our bundle — retry registration once
        await registerMutation.mutateAsync({
          bundle,
          oneTimePrekeys: serverPrekeys,
        });
        const retryStatus = await getBundleStatusServer(user.id);
        if (!retryStatus.registered) {
          throw new Error(
            "Server did not accept E2EE bundle registration after retry",
          );
        }
      }

      setState({
        identity,
        bundle,
        loading: false,
        error: null,
        registered: true,
        ready: true,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialize E2EE";
      setState((s) => ({ ...s, loading: false, error: message, ready: false }));
    }
  }, [user, registerMutation]);

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
