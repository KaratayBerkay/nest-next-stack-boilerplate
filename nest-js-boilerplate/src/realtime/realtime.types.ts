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
