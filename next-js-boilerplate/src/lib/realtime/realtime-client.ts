export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "authenticating"
  | "open"
  | "backoff"
  | "down"
  | "waiting";

import { refreshSessionResponse } from "@/lib/api-client";
import {
  performHandshake,
  encryptForServer,
  decryptFromServer,
  destroySession,
  hasSession,
  reKey,
  type WireEnvelopeV2,
} from "@/lib/crypto/session";

const TOPIC_ALLOWLIST = /^(feed|post:[a-z0-9]+)$/;

/** Control frames are always sent plaintext — the server routes them. */
function isControlFrame(data: Record<string, unknown>): boolean {
  return (
    data.type === "watch" ||
    data.type === "unwatch" ||
    data.type === "register" ||
    data.type === "page"
  );
}

/** True when a frame is already a server-bound WireEnvelopeV2. */
function isWireEnvelope(data: Record<string, unknown>): boolean {
  return (
    data.v === 2 &&
    typeof data.nonce === "string" &&
    typeof data.ct === "string"
  );
}

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private status: RealtimeStatus = "idle";
  private sendQueue: Record<string, unknown>[] = [];
  private topicWatches = new Set<string>();
  private registeredServices: string[] = [];
  private currentClaims: Map<
    string,
    { page: string | null; params?: Record<string, string> }
  > = new Map();
  private authFailRetries = 0;
  private pendingRefresh = false;
  private static readonly MAX_AUTH_FAIL_RETRIES = 3;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private hasConnectedBefore = false;
  private onlineHandler: (() => void) | null = null;
  private rekeyInProgress = false;
  private lastSessionId: string | null = null;
  private static readonly BACKOFF_BASE_MS = 1000;
  private static readonly BACKOFF_CAP_MS = 30_000;

  constructor(
    private readonly url: string,
    private readonly onStatusChange: (status: RealtimeStatus) => void,
    private readonly onFrame: (frame: Record<string, unknown>) => void,
    private readonly onAuthenticated?: () => void,
    private readonly onAuthExpired?: () => void,
  ) {}

  connect(): void {
    if (this.destroyed) return;
    this.setStatus("connecting");

    const open = () => {
      if (this.destroyed) return;
      let didOpen = false;
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        if (this.destroyed) return;
        didOpen = true;
        this.setStatus("authenticating");
      };

      ws.onmessage = (e) => {
        if (this.destroyed) return;
        try {
          const raw = JSON.parse(e.data) as Record<string, unknown>;

          // Server→client wire-encrypted frames: { v: 2, nonce, ct }
          if (
            raw.v === 2 &&
            typeof raw.nonce === "string" &&
            typeof raw.ct === "string"
          ) {
            if (!hasSession()) return;
            try {
              const frame = decryptFromServer(raw as unknown as WireEnvelopeV2);
              if (frame && typeof frame === "object") {
                this.onFrame(frame as Record<string, unknown>);
              }
            } catch {
              /* Decryption failure — stale keys or server flush.
                 Flush client keys and re-handshake. */
              if (!this.rekeyInProgress && this.lastSessionId) {
                this.rekeyInProgress = true;
                reKey(this.lastSessionId)
                  .then(() => {
                    this.rekeyInProgress = false;
                  })
                  .catch(() => {
                    this.rekeyInProgress = false;
                  });
              }
            }
            return;
          }

          // Control frames (unencrypted)
          if (raw.type === "authenticated") {
            const sessionId = raw.sessionId as string | undefined;
            this.authFailRetries = 0;
            this.performHandshakeAfterAuth(sessionId);
            return;
          }

          // Server detected a c2s decrypt failure (seq desync). Resync via a
          // fresh handshake — this adopts the server's counters (max of local
          // vs server) WITHOUT flushing keys, unlike an s2c failure's reKey.
          if (raw.type === "crypto-resync") {
            if (!this.rekeyInProgress && this.lastSessionId) {
              this.rekeyInProgress = true;
              performHandshake(this.lastSessionId)
                .catch(() => {})
                .finally(() => {
                  this.rekeyInProgress = false;
                });
            }
            return;
          }

          this.onFrame(raw);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onclose = () => {
        if (this.destroyed) return;
        this.ws = null;
        if (!didOpen) this.pendingRefresh = true;
        destroySession();
        this.handleDisconnect();
      };
    };

    if (this.pendingRefresh) {
      this.pendingRefresh = false;
      refreshSessionResponse()
        .then((res) => {
          if (res.ok) {
            open();
          } else if (res.status === 401) {
            // The refresh token itself was rejected — the session is dead
            // (revoked/expired) and the socket would only re-connect to be
            // rejected with session_miss. Stop the retry loop and hand the
            // decision to the app's hard-logout path instead of spinning
            // forever. Mirrors apiFetch's own 401-only escalation rule
            // (api-client.ts) so a definitive auth rejection is required.
            this.handleAuthExpired();
          } else {
            // Non-auth failure on the BFF side (backend unreachable mid
            // deploy, CSRF handshake hiccup, etc.) — not proof the session
            // is dead. Retry the socket via the existing backoff/degraded
            // retry loop instead of logging a possibly-still-valid user out.
            open();
          }
        })
        .catch(() => {
          // Network hiccup — not an auth failure. Retry the socket as before.
          open();
        });
    } else {
      open();
    }
  }

  private handleAuthExpired(): void {
    if (this.destroyed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.backoffTimer) {
      clearTimeout(this.backoffTimer);
      this.backoffTimer = null;
    }
    if (this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
    }
    this.ws?.close();
    this.ws = null;
    this.authFailRetries = 0;
    destroySession();
    this.setStatus("idle");
    this.onAuthExpired?.();
  }

  disconnect(): void {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.backoffTimer) clearTimeout(this.backoffTimer);
    if (this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
    }
    destroySession();
    this.ws?.close();
    this.ws = null;
    this.sendQueue = [];
    this.setStatus("idle");
  }

  send(data: Record<string, unknown>): void {
    // Control frames are never encrypted — the server routes them.
    const isControl = isControlFrame(data);

    if (isControl) {
      this.rawSend(data);
      return;
    }

    // Message frames: encrypt the entire payload as WireEnvelopeV2. Without
    // a session yet, queue the RAW payload — it is encrypted at flush time
    // (after the handshake), never sent plaintext.
    if (!hasSession()) {
      this.sendQueue.push(data);
      return;
    }

    try {
      this.rawSend(
        encryptForServer(data) as unknown as Record<string, unknown>,
      );
    } catch {
      /* session not ready yet — queue as-is (will be encrypted on flush) */
      this.sendQueue.push(data);
    }
  }

  watch(topic: string): void {
    if (!TOPIC_ALLOWLIST.test(topic)) return;
    this.topicWatches.add(topic);
    this.send({ type: "watch", topic });
  }

  unwatch(topic: string): void {
    this.topicWatches.delete(topic);
    this.send({ type: "unwatch", topic });
  }

  registerServices(services: string[]): void {
    this.registeredServices = services;
    this.send({ type: "register", services });
  }

  claimPage(
    page: string | null,
    params?: Record<string, string>,
    tabId?: string,
  ): void {
    const id = tabId ?? "_default";
    this.currentClaims.set(id, { page, params });
    this.send({ type: "page", page, params, tabId: id });
  }

  unclaimPage(tabId: string): void {
    this.currentClaims.delete(tabId);
    this.send({ type: "page", page: null, tabId });
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  // ---- Private ----

  private async performHandshakeAfterAuth(
    sessionId: string | undefined,
  ): Promise<void> {
    if (!sessionId) {
      // No session ID — treat as authenticated without wire-crypto.
      this.setStatus("open");
      this.flushQueue();
      this.replaySubscriptions();
      this.replayClaim();
      this.onAuthenticated?.();
      return;
    }

    this.lastSessionId = sessionId;

    try {
      await performHandshake(sessionId);
    } catch {
      // Handshake failed — continue without wire-crypto.
      // Messages will be sent/received as plaintext.
    }

    this.setStatus("open");
    this.flushQueue();
    this.replaySubscriptions();
    this.replayClaim();
    this.onAuthenticated?.();
  }

  private rawSend(data: Record<string, unknown>): void {
    if (this.status === "open" && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.sendQueue.push(data);
    }
  }

  private setStatus(s: RealtimeStatus): void {
    this.status = s;
    this.onStatusChange(s);
  }

  private flushQueue(): void {
    if (this.sendQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const pending: Record<string, unknown>[] = [];
      for (const msg of this.sendQueue) {
        // Pre-encrypted envelopes (queued by rawSend while the socket was
        // closed) go out as-is; control frames are always plaintext; raw
        // message payloads are encrypted now that the handshake completed.
        if (isWireEnvelope(msg)) {
          this.ws.send(JSON.stringify(msg));
        } else if (isControlFrame(msg)) {
          this.ws.send(JSON.stringify(msg));
        } else if (hasSession()) {
          try {
            this.ws.send(
              JSON.stringify(
                encryptForServer(msg) as unknown as Record<string, unknown>,
              ),
            );
          } catch {
            pending.push(msg);
          }
        } else {
          // Session still not established (degraded mode) — hold, don't
          // leak plaintext message frames.
          pending.push(msg);
        }
      }
      this.sendQueue = pending;
    }
  }

  private replaySubscriptions(): void {
    if (this.hasConnectedBefore && this.registeredServices.length > 0) {
      this.send({ type: "register", services: this.registeredServices });
    }
    this.hasConnectedBefore = true;
    for (const topic of this.topicWatches) {
      this.send({ type: "watch", topic });
    }
  }

  private replayClaim(): void {
    for (const [tabId, claim] of this.currentClaims) {
      this.send({
        type: "page",
        page: claim.page,
        params: claim.params,
        tabId,
      });
    }
  }

  private handleDisconnect(): void {
    if (this.authFailRetries < RealtimeClient.MAX_AUTH_FAIL_RETRIES) {
      this.authFailRetries++;
      this.startBackoff();
    } else {
      this.setStatus("down");
      this.scheduleDegradedRetry();
    }
  }

  private startBackoff(): void {
    const delay = Math.min(
      RealtimeClient.BACKOFF_BASE_MS *
        Math.pow(2, this.authFailRetries - 1) *
        (0.5 + Math.random() * 0.5),
      RealtimeClient.BACKOFF_CAP_MS,
    );
    this.setStatus("backoff");
    this.backoffTimer = setTimeout(() => this.connect(), delay);
  }

  private scheduleDegradedRetry(): void {
    const retry = () => {
      if (this.destroyed) return;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.onlineHandler) {
        window.removeEventListener("online", this.onlineHandler);
        this.onlineHandler = null;
      }
      this.authFailRetries = 0;
      this.connect();
    };
    this.onlineHandler = retry;
    window.addEventListener("online", retry, { once: true });
    this.reconnectTimer = setTimeout(retry, 60_000);
  }
}
