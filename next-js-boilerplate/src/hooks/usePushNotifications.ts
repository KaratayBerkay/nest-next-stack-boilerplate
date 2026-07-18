"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { clientEnv } from "@/lib/env";
import { usePushNotificationActions } from "@/api/client/push-notifications/actions";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [supported] = useState(
    typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
  );
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  const { subscribe: subscribePush, unsubscribe: unsubscribePush } =
    usePushNotificationActions();

  useEffect(() => {
    if (!supported) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        swRef.current = reg;
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        if (sub) setSubscription(sub);
      })
      .catch((err) =>
        console.error("Service worker registration failed:", err),
      );
  }, [supported]);

  const requestPermission = useCallback(async () => {
    if (!supported) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        const reg =
          swRef.current ?? (await navigator.serviceWorker.register("/sw.js"));
        swRef.current = reg;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            clientEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          ) as unknown as BufferSource,
        });
        setSubscription(sub);

        await subscribePush(sub.toJSON() as Record<string, unknown>);
      }
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
  }, [supported, subscribePush]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    try {
      await subscription.unsubscribe();
      setSubscription(null);

      await unsubscribePush(subscription.endpoint);
    } catch {
      // silent
    }
  }, [subscription, unsubscribePush]);

  return {
    supported,
    permission,
    subscription,
    requestPermission,
    unsubscribe,
  };
}
