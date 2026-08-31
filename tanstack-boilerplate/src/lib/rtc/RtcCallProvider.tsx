"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useReducer,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { activeCallQueryOptions } from "@/api/client/rtc/query";
import type { RtcCallProviderProps } from "@/types/lib/RtcCallProvider-types";
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";

export interface RtcCallPeer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export type RtcCallPhase =
  "idle" | "outgoing-ringing" | "incoming-ringing" | "connected";

export type RtcCallAction = "accept" | "cancel" | "hangup";

export interface RtcLiveKitInfo {
  token: string;
  roomName: string;
  maxDurationMinutes?: number;
}

export interface RtcCallState {
  phase: RtcCallPhase;
  callId: string | null;
  peer: RtcCallPeer | null;
  hasVideo: boolean;
  livekit: RtcLiveKitInfo | null;
  /** Server-side acceptedAt of the connected call — seeds the overlay timer
   *  so a reload doesn't restart the readout from 0:00. */
  connectedAt: string | null;
  warningSecondsRemaining: number | null;
  lastError: string | null;
  actionPending: RtcCallAction | null;
}

const IDLE_STATE: RtcCallState = {
  phase: "idle",
  callId: null,
  peer: null,
  hasVideo: true,
  livekit: null,
  connectedAt: null,
  warningSecondsRemaining: null,
  lastError: null,
  actionPending: null,
};

type Action =
  | { type: "START_OUTGOING"; peer: RtcCallPeer; hasVideo: boolean }
  | { type: "RINGING"; callId: string }
  | {
      type: "INCOMING";
      callId: string;
      peer: RtcCallPeer;
      hasVideo: boolean;
    }
  | {
      type: "ACCEPTED";
      source: "live" | "snapshot";
      callId: string;
      token: string;
      roomName: string;
      maxDurationMinutes?: number;
      peer?: RtcCallPeer;
      /** Snapshot recovery only — the live push's client already knows the
       *  call type from rtc:invite/startCall. Without this, a refreshed
       *  audio call rendered the video overlay (initial hasVideo is true). */
      hasVideo?: boolean;
      acceptedAt?: string;
    }
  | { type: "ACTION_PENDING"; action: RtcCallAction }
  | { type: "WARNING"; callId: string; secondsRemaining: number }
  | { type: "ENDED"; callId: string; reason?: string }
  | { type: "ERROR"; callId?: string; reason: string }
  | { type: "RESET" };

function reducer(state: RtcCallState, action: Action): RtcCallState {
  switch (action.type) {
    case "START_OUTGOING":
      return {
        ...IDLE_STATE,
        phase: "outgoing-ringing",
        peer: action.peer,
        hasVideo: action.hasVideo,
        actionPending: null,
      };
    case "RINGING":
      if (state.phase !== "outgoing-ringing" || state.callId) return state;
      return { ...state, callId: action.callId };
    case "INCOMING":
      if (state.phase !== "idle") return state;
      return {
        ...IDLE_STATE,
        phase: "incoming-ringing",
        callId: action.callId,
        peer: action.peer,
        hasVideo: action.hasVideo,
        actionPending: null,
      };
    case "ACCEPTED":
      if (
        (state.phase !== "outgoing-ringing" &&
          state.phase !== "incoming-ringing" &&
          !(action.source === "snapshot" && state.phase === "idle")) ||
        (state.callId && state.callId !== action.callId)
      ) {
        return state;
      }
      return {
        ...state,
        phase: "connected",
        callId: action.callId,
        peer: action.peer ?? state.peer,
        hasVideo: action.hasVideo ?? state.hasVideo,
        livekit: {
          token: action.token,
          roomName: action.roomName,
          maxDurationMinutes: action.maxDurationMinutes,
        },
        connectedAt: action.acceptedAt ?? new Date().toISOString(),
        actionPending: null,
      };
    case "ACTION_PENDING":
      if (
        (action.action === "accept" && state.phase !== "incoming-ringing") ||
        (action.action === "cancel" && state.phase !== "outgoing-ringing") ||
        (action.action === "hangup" && state.phase !== "connected")
      ) {
        return state;
      }
      return { ...state, actionPending: action.action };
    case "WARNING":
      if (state.callId !== action.callId) return state;
      return { ...state, warningSecondsRemaining: action.secondsRemaining };
    case "ENDED":
      if (state.callId !== action.callId) return state;
      return IDLE_STATE;
    case "ERROR":
      if (action.callId && state.callId && action.callId !== state.callId) {
        return state;
      }
      return { ...IDLE_STATE, lastError: action.reason };
    case "RESET":
      return IDLE_STATE;
    default:
      return state;
  }
}

interface RtcCallContextValue {
  state: RtcCallState;
  startCall: (peer: RtcCallPeer, hasVideo: boolean) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  cancelCall: () => void;
  hangupCall: () => void;
  dismissError: () => void;
}

const RtcCallContext = createContext<RtcCallContextValue | null>(null);

export function RtcCallProvider({ children }: RtcCallProviderProps) {
  const realtime = useRealtime();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, IDLE_STATE);
  const cancelRequestedRef = useRef(false);

  // Every ACTION_PENDING (accept/cancel) relies entirely on a later
  // rtc:accepted/rtc:error/rtc:cancelled frame to clear it — there was no
  // client-side timeout anywhere. If that frame is ever dropped (a WS
  // hiccup right after the action), the full-screen call overlay becomes
  // permanently non-interactive (both Accept and Decline disable while
  // actionPending is set) with no way out short of a hard reload. This
  // bounds the wait instead of trusting the network unconditionally.
  useEffect(() => {
    if (!state.actionPending) return;
    const pendingAction = state.actionPending;
    const pendingCallId = state.callId;
    const timer = setTimeout(() => {
      logRtcEvent({
        event: "call.action_timeout",
        rtcKind: "call",
        rtcId: pendingCallId ?? undefined,
        phase: state.phase,
        exceptionType: "CLIENT_ERROR",
        error: `${pendingAction}_ack_timeout`,
      });
      dispatch({
        type: "ERROR",
        callId: pendingCallId ?? undefined,
        reason: "action_timeout",
      });
    }, 10_000);
    return () => clearTimeout(timer);
  }, [state.actionPending, state.callId, state.phase]);

  // Recovery path: a client that (re)connected may have missed the
  // point-in-time rtc:invite/rtc:accepted push (see resyncAfterConnect,
  // which invalidates this query on every WS reconnect).
  const { data: snapshot } = useQuery(activeCallQueryOptions());
  useEffect(() => {
    if (!snapshot || state.phase !== "idle") return;
    if (
      snapshot.type === "rtc:invite" &&
      typeof snapshot.callId === "string" &&
      snapshot.callerId
    ) {
      dispatch({
        type: "INCOMING",
        callId: snapshot.callId,
        peer: {
          id: snapshot.callerId,
          name: snapshot.callerName ?? "",
          avatarUrl: snapshot.callerAvatarUrl ?? null,
        },
        hasVideo: Boolean(snapshot.hasVideo),
      });
      logRtcEvent({
        event: "call.invite_recovered",
        rtcKind: "call",
        rtcId: snapshot.callId,
        mediaType: snapshot.hasVideo ? "video" : "audio",
        phase: "incoming-ringing",
      });
      queryClient.setQueryData(["rtc", "active-call"], null);
    } else if (
      snapshot.type === "rtc:accepted" &&
      typeof snapshot.callId === "string" &&
      snapshot.token &&
      snapshot.roomName
    ) {
      dispatch({
        type: "ACCEPTED",
        source: "snapshot",
        callId: snapshot.callId,
        token: snapshot.token,
        roomName: snapshot.roomName,
        maxDurationMinutes: snapshot.maxDurationMinutes,
        hasVideo:
          snapshot.hasVideo === undefined
            ? undefined
            : Boolean(snapshot.hasVideo),
        acceptedAt: snapshot.acceptedAt,
        peer: snapshot.peerId
          ? {
              id: snapshot.peerId,
              name: snapshot.peerName ?? "",
              avatarUrl: snapshot.peerAvatarUrl ?? null,
            }
          : undefined,
      });
      logRtcEvent({
        event: "call.accepted_recovered",
        rtcKind: "call",
        rtcId: snapshot.callId,
        roomName: snapshot.roomName,
        phase: "connected",
      });
      queryClient.setQueryData(["rtc", "active-call"], null);
    }
    // The idle guard above keeps this a no-op once a live call is already
    // being tracked — safe to also re-run on phase changes.
  }, [queryClient, snapshot, state.phase]);

  useEffect(() => {
    if (!realtime) return;
    const unsubscribers = [
      realtime.subscribe("rtc:ringing", (data) => {
        if (typeof data.callId === "string") {
          if (cancelRequestedRef.current) {
            cancelRequestedRef.current = false;
            realtime.send({ type: "rtc:cancel", callId: data.callId });
            logRtcEvent({
              event: "call.cancel_sent",
              rtcKind: "call",
              rtcId: data.callId,
              phase: "outgoing-ringing",
              metadata: { reason: "cancel_before_call_id" },
            });
            queryClient.setQueryData(["rtc", "active-call"], null);
            dispatch({ type: "RESET" });
            return;
          }
          logRtcEvent({
            event: "call.ringing_received",
            rtcKind: "call",
            rtcId: data.callId,
            phase: "outgoing-ringing",
          });
          dispatch({ type: "RINGING", callId: data.callId });
        }
      }),
      realtime.subscribe("rtc:invite", (data) => {
        if (
          typeof data.callId !== "string" ||
          typeof data.callerId !== "string"
        )
          return;
        dispatch({
          type: "INCOMING",
          callId: data.callId,
          peer: {
            id: data.callerId,
            name: typeof data.callerName === "string" ? data.callerName : "",
            avatarUrl:
              typeof data.callerAvatarUrl === "string"
                ? data.callerAvatarUrl
                : null,
          },
          hasVideo: Boolean(data.hasVideo),
        });
        logRtcEvent({
          event: "call.invite_received",
          rtcKind: "call",
          rtcId: data.callId,
          mediaType: data.hasVideo ? "video" : "audio",
          phase: "incoming-ringing",
        });
      }),
      realtime.subscribe("rtc:accepted", (data) => {
        if (
          typeof data.callId !== "string" ||
          typeof data.token !== "string" ||
          typeof data.roomName !== "string"
        ) {
          return;
        }
        dispatch({
          type: "ACCEPTED",
          callId: data.callId,
          source: "live",
          token: data.token,
          roomName: data.roomName,
          maxDurationMinutes:
            typeof data.maxDurationMinutes === "number"
              ? data.maxDurationMinutes
              : undefined,
        });
        logRtcEvent({
          event: "call.accepted_received",
          rtcKind: "call",
          rtcId: data.callId,
          roomName: data.roomName,
          phase: "connected",
        });
      }),
      realtime.subscribe("rtc:rejected", (data) => {
        if (typeof data.callId === "string") {
          logRtcEvent({
            event: "call.rejected_received",
            rtcKind: "call",
            rtcId: data.callId,
            phase: "outgoing-ringing",
          });
          queryClient.setQueryData(["rtc", "active-call"], null);
          dispatch({ type: "ENDED", callId: data.callId, reason: "rejected" });
        }
      }),
      realtime.subscribe("rtc:cancelled", (data) => {
        if (typeof data.callId === "string") {
          logRtcEvent({
            event: "call.cancelled_received",
            rtcKind: "call",
            rtcId: data.callId,
            phase: "outgoing-ringing",
          });
          queryClient.setQueryData(["rtc", "active-call"], null);
          dispatch({ type: "ENDED", callId: data.callId, reason: "cancelled" });
        }
      }),
      realtime.subscribe("rtc:hangup", (data) => {
        if (typeof data.callId === "string") {
          logRtcEvent({
            event: "call.hangup_received",
            rtcKind: "call",
            rtcId: data.callId,
            phase: "connected",
            metadata: {
              reason: typeof data.reason === "string" ? data.reason : "hangup",
            },
          });
          queryClient.setQueryData(["rtc", "active-call"], null);
          dispatch({
            type: "ENDED",
            callId: data.callId,
            reason: typeof data.reason === "string" ? data.reason : "hangup",
          });
        }
      }),
      realtime.subscribe("rtc:missed", (data) => {
        if (typeof data.callId === "string") {
          logRtcEvent({
            event: "call.missed_received",
            rtcKind: "call",
            rtcId: data.callId,
            phase: "outgoing-ringing",
          });
          queryClient.setQueryData(["rtc", "active-call"], null);
          dispatch({ type: "ENDED", callId: data.callId, reason: "missed" });
        }
      }),
      realtime.subscribe("rtc:call-limit-warning", (data) => {
        if (typeof data.callId === "string") {
          logRtcEvent({
            event: "call.limit_warning_received",
            rtcKind: "call",
            rtcId: data.callId,
            phase: "connected",
            metadata: {
              secondsRemaining: data.secondsRemaining,
            },
          });
          dispatch({
            type: "WARNING",
            callId: data.callId,
            secondsRemaining:
              typeof data.secondsRemaining === "number"
                ? data.secondsRemaining
                : 60,
          });
        }
      }),
      realtime.subscribe("rtc:error", (data) => {
        cancelRequestedRef.current = false;
        logRtcEvent({
          event: "call.error_received",
          rtcKind: "call",
          rtcId: typeof data.callId === "string" ? data.callId : undefined,
          exceptionType: "CLIENT_ERROR",
          error: typeof data.reason === "string" ? data.reason : "error",
          metadata: { source: "realtime" },
        });
        dispatch({
          type: "ERROR",
          callId: typeof data.callId === "string" ? data.callId : undefined,
          reason: typeof data.reason === "string" ? data.reason : "error",
        });
      }),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [queryClient, realtime]);

  const startCall = useCallback(
    (peer: RtcCallPeer, hasVideo: boolean) => {
      if (state.phase !== "idle") return;
      if (!realtime || realtime.status !== "open") {
        logRtcEvent({
          event: "call.invite_failed",
          rtcKind: "call",
          mediaType: hasVideo ? "video" : "audio",
          phase: "idle",
          exceptionType: "CLIENT_ERROR",
          error: "realtime_unavailable",
          metadata: { peerId: peer.id },
        });
        dispatch({ type: "ERROR", reason: "realtime_unavailable" });
        return;
      }
      cancelRequestedRef.current = false;
      dispatch({ type: "START_OUTGOING", peer, hasVideo });
      logRtcEvent({
        event: "call.invite_sent",
        rtcKind: "call",
        mediaType: hasVideo ? "video" : "audio",
        phase: "outgoing-ringing",
        metadata: { peerId: peer.id },
      });
      realtime.send({ type: "rtc:invite", calleeId: peer.id, hasVideo });
    },
    [realtime, state.phase],
  );

  const acceptCall = useCallback(() => {
    if (
      !realtime ||
      !state.callId ||
      state.phase !== "incoming-ringing" ||
      state.actionPending
    )
      return;
    if (realtime.status !== "open") {
      logRtcEvent({
        event: "call.accept_failed",
        rtcKind: "call",
        rtcId: state.callId,
        phase: "incoming-ringing",
        exceptionType: "CLIENT_ERROR",
        error: "realtime_unavailable",
      });
      dispatch({
        type: "ERROR",
        callId: state.callId,
        reason: "realtime_unavailable",
      });
      return;
    }
    dispatch({ type: "ACTION_PENDING", action: "accept" });
    logRtcEvent({
      event: "call.accept_sent",
      rtcKind: "call",
      rtcId: state.callId,
      mediaType: state.hasVideo ? "video" : "audio",
      phase: "incoming-ringing",
    });
    realtime.send({ type: "rtc:accept", callId: state.callId });
  }, [
    realtime,
    state.actionPending,
    state.callId,
    state.hasVideo,
    state.phase,
  ]);

  const rejectCall = useCallback(() => {
    if (
      !state.callId ||
      state.phase !== "incoming-ringing" ||
      state.actionPending
    )
      return;
    if (realtime) realtime.send({ type: "rtc:reject", callId: state.callId });
    logRtcEvent({
      event: "call.reject_sent",
      rtcKind: "call",
      rtcId: state.callId,
      mediaType: state.hasVideo ? "video" : "audio",
      phase: "incoming-ringing",
    });
    queryClient.setQueryData(["rtc", "active-call"], null);
    dispatch({ type: "RESET" });
  }, [
    queryClient,
    realtime,
    state.actionPending,
    state.callId,
    state.hasVideo,
    state.phase,
  ]);

  const cancelCall = useCallback(() => {
    if (!realtime || state.phase !== "outgoing-ringing" || state.actionPending)
      return;
    if (!state.callId) {
      // The invite and its callId travel on separate frames. Keep the call
      // alive just long enough to cancel it as soon as the id arrives.
      cancelRequestedRef.current = true;
      logRtcEvent({
        event: "call.cancel_requested",
        rtcKind: "call",
        mediaType: state.hasVideo ? "video" : "audio",
        phase: "outgoing-ringing",
      });
      dispatch({ type: "ACTION_PENDING", action: "cancel" });
      return;
    }
    realtime.send({ type: "rtc:cancel", callId: state.callId });
    logRtcEvent({
      event: "call.cancel_sent",
      rtcKind: "call",
      rtcId: state.callId,
      mediaType: state.hasVideo ? "video" : "audio",
      phase: "outgoing-ringing",
    });
    queryClient.setQueryData(["rtc", "active-call"], null);
    dispatch({ type: "RESET" });
  }, [
    queryClient,
    realtime,
    state.actionPending,
    state.callId,
    state.hasVideo,
    state.phase,
  ]);

  const hangupCall = useCallback(() => {
    if (!state.callId || state.phase !== "connected") return;
    if (realtime) realtime.send({ type: "rtc:hangup", callId: state.callId });
    logRtcEvent({
      event: "call.hangup_sent",
      rtcKind: "call",
      rtcId: state.callId,
      mediaType: state.hasVideo ? "video" : "audio",
      phase: "connected",
    });
    queryClient.setQueryData(["rtc", "active-call"], null);
    dispatch({ type: "RESET" });
  }, [queryClient, realtime, state.callId, state.hasVideo, state.phase]);

  const dismissError = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <RtcCallContext.Provider
      value={{
        state,
        startCall,
        acceptCall,
        rejectCall,
        cancelCall,
        hangupCall,
        dismissError,
      }}
    >
      {children}
    </RtcCallContext.Provider>
  );
}

export function useRtcCall(): RtcCallContextValue {
  const ctx = useContext(RtcCallContext);
  if (!ctx) throw new Error("useRtcCall must be used within RtcCallProvider");
  return ctx;
}
