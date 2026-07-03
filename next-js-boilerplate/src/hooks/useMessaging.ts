"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  startTransition,
} from "react";
import { initials } from "@/lib/initials";
import { clientEnv } from "@/lib/env";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { apiFetch } from "@/lib/api-client";

const MSG_WS_URL = clientEnv.NEXT_PUBLIC_MSG_WS_URL;

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  body: string;
  createdAt: string;
}

export interface Conversation {
  user: User;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export interface RoomMember {
  id: string;
  name: string;
  avatar: string;
}

export interface FriendRequest {
  id: string;
  user: User;
  createdAt: string;
  direction?: "incoming" | "outgoing";
}

export interface RoomEvent {
  type: "user-joined" | "user-left" | "room-message";
  room: string;
  user?: RoomMember;
  message?: RoomMessage;
  members?: RoomMember[];
}

export function useMessaging(
  token: string | null,
  userId: string | null,
  selectedUserId?: string | null,
) {
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [userId: string]: Message[] }>({});
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState<{ [userId: string]: boolean }>({});
  const wsRef = useRef<WebSocket | null>(null);
  const selectedUserIdRef = useRef(selectedUserId);
  const sendingRef = useRef(false);
  const { rateLimited, checkRateLimit } = useRateLimiter();
  const fetchMsgsLoadingRef = useRef(false);
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const fetchFriends = useCallback(async (q?: string) => {
    const res = await apiFetch(
      `/api/messages/friends${q ? "?q=" + encodeURIComponent(q) : ""}`,
    );
    if (res.ok) setFriends(await res.json());
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    const res = await apiFetch("/api/messages/friends/requests");
    if (res.ok) setFriendRequests(await res.json());
  }, []);

  const fetchConversations = useCallback(async () => {
    const res = await apiFetch("/api/messages/conversations");
    if (res.ok) setConversations(await res.json());
  }, []);

  const sendFriendRequest = useCallback(
    async (addresseeId: string) => {
      const res = await apiFetch(`/api/messages/friends/request/${addresseeId}`, {
        method: "POST",
      });
      if (res.ok) fetchFriendRequests();
      return res.ok;
    },
    [fetchFriendRequests],
  );

  const acceptFriendRequest = useCallback(
    async (requesterId: string) => {
      const res = await apiFetch(`/api/messages/friends/accept/${requesterId}`, {
        method: "POST",
      });
      if (res.ok) {
        setFriendRequests((prev) =>
          prev.filter((r) => r.user.id !== requesterId),
        );
        fetchFriends();
        fetchConversations();
      }
      return res.ok;
    },
    [fetchFriends, fetchConversations],
  );

  const declineFriendRequest = useCallback(async (requesterId: string) => {
    const res = await apiFetch(`/api/messages/friends/decline/${requesterId}`, {
      method: "POST",
    });
    if (res.ok) {
      setFriendRequests((prev) =>
        prev.filter((r) => r.user.id !== requesterId),
      );
    }
    return res.ok;
  }, []);

  const markMessagesRead = useCallback(async (targetUserId: string) => {
    const res = await apiFetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId }),
    });
    if (res.ok) {
      setConversations((prev) =>
        prev.map((c) => (c.user.id === targetUserId ? { ...c, unread: 0 } : c)),
      );
    }
    return res.ok;
  }, []);

  useEffect(() => {
    if (!token) return;
    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let wasAuthenticated = false;
    let authFailRetries = 0;
    const MAX_AUTH_FAIL_RETRIES = 3;

    async function refreshBeforeReconnect() {
      try {
        await apiFetch("/api/auth/refresh", { method: "POST" });
      } catch {
        /* refresh failed — will try connecting anyway */
      }
    }

    function connect() {
      const ws = new WebSocket(MSG_WS_URL);
      wsRef.current = ws;
      ws.onopen = async () => {
        let accessToken = token;
        let rbacToken = "";
        let deviceToken = "";
        let userToken = "";
        try {
          const res = await apiFetch("/api/auth/token");
          if (res.ok) {
            const t = (await res.json()) as {
              accessToken: string;
              rbacToken: string;
              deviceToken: string;
              userToken: string;
            };
            accessToken = t.accessToken;
            rbacToken = t.rbacToken;
            deviceToken = t.deviceToken;
            userToken = t.userToken;
          }
        } catch {}
        ws.send(
          JSON.stringify({
            type: "auth",
            tokens: { accessToken, rbacToken, deviceToken, userToken },
          }),
        );
      };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          // The server answers a bad token quadruple with an error message but
          // keeps the socket open (120s auth timeout); close it ourselves so
          // the refresh-on-unauthenticated-close path runs immediately.
          if (
            data.type === "error" &&
            !wasAuthenticated &&
            /auth/i.test(String(data.message ?? ""))
          ) {
            ws.close();
            return;
          }
          if (data.type === "authenticated") {
            wasAuthenticated = true;
            authFailRetries = 0;
            setConnected(true);
            fetchConversations();
            fetchFriends();
            fetchFriendRequests();
            return;
          }
          if (data.type === "online-users") {
            setOnlineUsers(
              new Set(data.users.map((u: { id: string }) => u.id)),
            );
            return;
          }
          switch (data.type) {
            case "direct-message": {
              const msg = data.message;
              const otherId =
                msg.senderId === userId ? msg.recipientId : msg.senderId;
              const isViewing =
                msg.recipientId === userId &&
                selectedUserIdRef.current === msg.senderId;
              setMessages((prev) => {
                const existing = prev[otherId] || [];
                if (existing.some((m) => m.id === msg.id)) return prev;
                const newMsg = isViewing
                  ? { ...msg, readAt: new Date().toISOString() }
                  : msg;
                return {
                  ...prev,
                  [otherId]: [...existing, newMsg],
                };
              });
              setConversations((prev) => {
                const idx = prev.findIndex((c) => c.user.id === otherId);
                if (idx >= 0) {
                  return prev.map((c) =>
                    c.user.id === otherId
                      ? {
                          ...c,
                          lastMessage: msg.body,
                          lastTime: msg.createdAt,
                          unread:
                            msg.senderId === userId ||
                            otherId === selectedUserIdRef.current
                              ? c.unread
                              : c.unread + 1,
                        }
                      : c,
                  );
                }
                if (msg.senderId === userId || !msg.sender) return prev;
                return [
                  {
                    user: { ...msg.sender },
                    lastMessage: msg.body,
                    lastTime: msg.createdAt,
                    unread: otherId === selectedUserIdRef.current ? 0 : 1,
                  },
                  ...prev,
                ];
              });
              if (
                msg.recipientId === userId &&
                wsRef.current?.readyState === WebSocket.OPEN
              ) {
                wsRef.current.send(
                  JSON.stringify({ type: "delivered-ack", messageId: msg.id }),
                );
                if (isViewing) markMessagesRead(msg.senderId);
              }
              break;
            }
            case "message-delivered":
              setMessages((prev) => {
                const updated = { ...prev };
                for (const uid of Object.keys(updated)) {
                  updated[uid] = updated[uid].map((m) =>
                    m.id === data.messageId
                      ? { ...m, deliveredAt: data.deliveredAt }
                      : m,
                  );
                }
                return updated;
              });
              break;
            case "message-read":
              if (data.readAt) {
                setMessages((prev) => {
                  const updated = { ...prev };
                  for (const uid of Object.keys(updated)) {
                    updated[uid] = updated[uid].map((m) =>
                      m.recipientId === data.readerId && m.senderId === userId
                        ? { ...m, readAt: data.readAt }
                        : m,
                    );
                  }
                  return updated;
                });
              }
              setConversations((prev) =>
                prev.map((c) =>
                  c.user.id === data.senderId ? { ...c, unread: 0 } : c,
                ),
              );
              break;
            case "user-online":
              setOnlineUsers((prev) => new Set(prev).add(data.user.id));
              break;
            case "user-offline":
              setOnlineUsers((prev) => {
                const next = new Set(prev);
                next.delete(data.userId);
                return next;
              });
              break;
          }
        } catch {
          /* ignore */
        }
      };
      ws.onclose = async () => {
        setConnected(false);
        const wasAuth = wasAuthenticated;
        wasAuthenticated = false;
        wsRef.current = null;
        if (stopped) return;
        // If the WS closed without ever authenticating, run a refresh
        // to rotate stale cookies before reconnecting (midnight cutoff,
        // tier change, etc.)
        if (!wasAuth && authFailRetries < MAX_AUTH_FAIL_RETRIES) {
          authFailRetries++;
          await refreshBeforeReconnect();
        }
        reconnectTimer = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [
    token,
    userId,
    fetchConversations,
    fetchFriends,
    fetchFriendRequests,
    markMessagesRead,
  ]);

  const fetchMessages = useCallback(async (userId: string, before?: string) => {
    if (fetchMsgsLoadingRef.current) return { messages: [], hasMore: false };
    fetchMsgsLoadingRef.current = true;
    try {
      const params = new URLSearchParams();
      if (before) params.set("before", before);
      params.set("take", "30");
      const res = await apiFetch(
        `/api/messages/conversations/${userId}/messages?${params}`,
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => ({
          ...prev,
          [userId]: before
            ? [...(data.messages as Message[]), ...(prev[userId] || [])]
            : (data.messages as Message[]),
        }));
        setHasMore((prev) => ({ ...prev, [userId]: data.hasMore }));
        return { messages: data.messages, hasMore: data.hasMore };
      }
      return { messages: [], hasMore: false };
    } finally {
      fetchMsgsLoadingRef.current = false;
    }
  }, []);

  const sendMessage = useCallback(async (recipientId: string, text: string) => {
    if (sendingRef.current) return;
    if (checkRateLimit()) return;
    sendingRef.current = true;
    try {
      const res = await apiFetch(
        `/api/messages/conversations/${recipientId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        },
      );
      if (!res.ok) {
        console.error("Failed to send message", res.status);
      }
    } finally {
      sendingRef.current = false;
    }
  }, []);

  return {
    conversations,
    messages,
    connected,
    onlineUsers,
    rateLimited,
    hasMore,
    friends,
    friendRequests,
    fetchFriends,
    fetchFriendRequests,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessagesRead,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
  };
}

export function useChatRoom(
  token: string | null,
  roomName: string | null,
  userId: string | null,
  userName: string | null,
) {
  const [connected, setConnected] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const roomRef = useRef(roomName);
  const prevRoomRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const sendingRef = useRef(false);
  const { rateLimited, checkRateLimit } = useRateLimiter();
  const tempIdCounter = useRef(0);
  const pendingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    roomRef.current = roomName;
  }, [roomName]);

  const clearPendingTimers = useCallback(() => {
    for (const timer of pendingTimersRef.current.values()) {
      clearTimeout(timer);
    }
    pendingTimersRef.current.clear();
  }, []);

  const fetchRoomMessages = useCallback(
    async (room: string, before?: string) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      const params = new URLSearchParams();
      if (before) params.set("before", before);
      params.set("take", "30");
      try {
        const res = await apiFetch(
          `/api/messages/rooms/${room}/messages?${params}`,
        );
        if (res.ok) {
          const data = await res.json();
          setRoomMessages((prev) =>
            before
              ? [...(data.messages as RoomMessage[]), ...prev]
              : (data.messages as RoomMessage[]),
          );
          setHasMore(data.hasMore);
        }
      } finally {
        loadingRef.current = false;
      }
    },
    [],
  );

  // Persistent WS connection (reconnect on token change)
  useEffect(() => {
    if (!token) return;
    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let wasAuthenticated = false;
    let authFailRetries = 0;
    const MAX_AUTH_FAIL_RETRIES = 3;

    async function refreshBeforeReconnect() {
      try {
        await apiFetch("/api/auth/refresh", { method: "POST" });
      } catch {
        /* refresh failed — will try connecting anyway */
      }
    }

    function connect() {
      const ws = new WebSocket(MSG_WS_URL);
      wsRef.current = ws;

      ws.onopen = async () => {
        let accessToken = token;
        let rbacToken = "";
        let deviceToken = "";
        let userToken = "";
        try {
          const res = await apiFetch("/api/auth/token");
          if (res.ok) {
            const t = (await res.json()) as {
              accessToken: string;
              rbacToken: string;
              deviceToken: string;
              userToken: string;
            };
            accessToken = t.accessToken;
            rbacToken = t.rbacToken;
            deviceToken = t.deviceToken;
            userToken = t.userToken;
          }
        } catch {}
        ws.send(
          JSON.stringify({
            type: "auth",
            tokens: { accessToken, rbacToken, deviceToken, userToken },
          }),
        );
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          // The server answers a bad token quadruple with an error message but
          // keeps the socket open (120s auth timeout); close it ourselves so
          // the refresh-on-unauthenticated-close path runs immediately.
          if (
            data.type === "error" &&
            !wasAuthenticated &&
            /auth/i.test(String(data.message ?? ""))
          ) {
            ws.close();
            return;
          }
          if (data.type === "authenticated") {
            wasAuthenticated = true;
            authFailRetries = 0;
            setConnected(true);
            ws.send(JSON.stringify({ type: "get-room-counts" }));
            const current = roomRef.current;
            if (current) {
              ws.send(JSON.stringify({ type: "join-room", room: current }));
            }
            return;
          }
          switch (data.type) {
            case "user-joined":
            case "user-left":
              if (data.members) setMembers(data.members);
              break;
            case "room-message":
              if (data.tempId) {
                const timer = pendingTimersRef.current.get(data.tempId);
                if (timer) {
                  clearTimeout(timer);
                  pendingTimersRef.current.delete(data.tempId);
                }
                sendingRef.current = false;
              }
              setRoomMessages((prev) => {
                if (data.tempId) {
                  const filtered = prev.filter((m) => m.id !== data.tempId);
                  return [...filtered, data.message];
                }
                return [...prev, data.message];
              });
              break;
            case "room-counts":
              if (data.rooms) setRoomCounts(data.rooms);
              break;
          }
        } catch {}
      };

      ws.onclose = async () => {
        setConnected(false);
        wsRef.current = null;
        clearPendingTimers();
        sendingRef.current = false;
        if (stopped) return;
        const wasAuth = wasAuthenticated;
        wasAuthenticated = false;
        if (!wasAuth && authFailRetries < MAX_AUTH_FAIL_RETRIES) {
          authFailRetries++;
          await refreshBeforeReconnect();
        }
        reconnectTimer = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
      clearPendingTimers();
    };
  }, [token, clearPendingTimers]);

  // Switch rooms without reconnect
  useEffect(() => {
    if (!roomName) return;
    const prev = prevRoomRef.current;
    prevRoomRef.current = roomName;
    startTransition(() => {
      setRoomMessages([]);
      setMembers([]);
      setRoomCounts({});
    });
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (prev && prev !== roomName) {
        wsRef.current.send(JSON.stringify({ type: "leave-room", room: prev }));
      }
      wsRef.current.send(JSON.stringify({ type: "join-room", room: roomName }));
    }
    fetchRoomMessages(roomName);
  }, [roomName, fetchRoomMessages]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!roomName || !text.trim() || sendingRef.current) return;
      if (checkRateLimit()) return;
      sendingRef.current = true;
      const tid = `temp-${Date.now()}-${++tempIdCounter.current}`;
      const optimistic: RoomMessage = {
        id: tid,
        senderId: userId!,
        senderName: userName!,
        avatar: initials(userName!),
        body: text.trim(),
        createdAt: new Date().toISOString(),
      };
      setRoomMessages((prev) => [...prev, optimistic]);
      wsRef.current?.send(
        JSON.stringify({
          type: "room-message",
          room: roomName,
          text: text.trim(),
          tempId: tid,
        }),
      );

      // Timeout: if echo doesn't arrive in 10s, clear lock and remove phantom message
      const timer = setTimeout(() => {
        pendingTimersRef.current.delete(tid);
        sendingRef.current = false;
        setRoomMessages((prev) => prev.filter((m) => m.id !== tid));
      }, 10_000);
      pendingTimersRef.current.set(tid, timer);
    },
    [roomName, userId, userName],
  );

  return {
    connected,
    members,
    messages: roomMessages,
    roomCounts,
    rateLimited,
    hasMore,
    fetchRoomMessages,
    sendMessage,
  };
}
