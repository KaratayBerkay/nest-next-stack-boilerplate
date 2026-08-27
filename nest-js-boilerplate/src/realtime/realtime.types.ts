import type { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import type { SessionUser } from '../auth/auth.types';

export type AuthWs = WebSocket & {
  userId?: string;
  sessionId?: string;
  userName?: string;
  chatNickname?: string;
  useNickname?: boolean;
  avatarUrl?: string | null;
  tier?: string;
  socketId?: string;
  room?: string;
  authenticated: boolean;
  isAlive: boolean;
  /** Set when this socket was replaced by a newer connection for the same
   *  device. Its cleanup already ran synchronously during the replacement;
   *  the close handler must not run it again (the shared deterministic
   *  socketId would clobber the replacement socket's state). */
  detached?: boolean;
  deviceTokenHash?: string;
  registeredServices?: string[];
  watchedTopics?: string[];
  clientIp?: string;
  page?: string | null;
  pageParams?: Record<string, string>;
  tabClaims: Map<
    string,
    { page: string | null; params?: Record<string, string> }
  >;
  /**
   * Per-connection processing chain — each inbound frame's handleMessage()
   * call is appended after the previous one instead of firing independently.
   * `ws`'s `'message'` event fires in wire order, but handleMessage is async
   * (wire-crypto decrypt, DB writes), so without this, two frames sent back
   * to back on the same socket could finish (and broadcast/persist) out of
   * the order the client actually sent them in. Different sockets still run
   * fully concurrently — this only serializes one connection's own frames.
   */
  _processingChain?: Promise<void>;
};

/**
 * The upgrade request, carrying the session `verifyUpgrade` already validated
 * (plus the raw device-token cookie, needed for `deviceTokenHash`) — stashed
 * there because `ws` hands the very same object reference to the `connection`
 * event, so there's nothing to re-derive or re-check.
 */
export type VerifiedUpgradeRequest = IncomingMessage & {
  sessionUser?: SessionUser;
  deviceToken?: string | null;
};

export type FrameHandler = (
  ws: WebSocket,
  data: Record<string, unknown>,
) => void | Promise<void>;
