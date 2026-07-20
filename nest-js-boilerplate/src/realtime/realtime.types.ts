import { WebSocket } from 'ws';

export type AuthWs = WebSocket & {
  userId?: string;
  sessionId?: string;
  userName?: string;
  tier?: string;
  socketId?: string;
  room?: string;
  authenticated: boolean;
  isAlive: boolean;
  deviceTokenHash?: string;
  userToken?: string;
  registeredServices?: string[];
  watchedTopics?: string[];
  pendingIp?: string;
  page?: string | null;
  pageParams?: Record<string, string>;
  tabClaims: Map<
    string,
    { page: string | null; params?: Record<string, string> }
  >;
};

export interface AuthTokens {
  accessToken: string;
  rbacToken: string;
  deviceToken: string;
  userToken: string;
}

export type FrameHandler = (
  ws: WebSocket,
  data: Record<string, unknown>,
) => void | Promise<void>;
