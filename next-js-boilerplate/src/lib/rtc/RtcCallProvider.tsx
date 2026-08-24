"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { activeCallQueryOptions } from "@/api/client/rtc/query";
import type { RtcCallProviderProps } from "@/types/lib/RtcCallProvider-types";

export interface RtcCallPeer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export type RtcCallPhase =
  | "idle"
  | "outgoing-ringing"
  | "incoming-ringing"
  | "connected";

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
  warningSecondsRemaining: number | null;
  lastError: string | null;
}

const IDLE_STATE: RtcCallState = {
  phase: "idle",
  callId: null,
  peer: null,
  hasVideo: true,
  livekit: null,
  warningSecondsRemaining: null,
  lastError: null,
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
      callId: string;
      token: string;
      roomName: string;
      maxDurationMinutes?: number;
      peer?: RtcCallPeer;
    }
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
      };
    case "ACCEPTED":
      if (
        (state.phase !== "outgoing-ringing" &&
          state.phase !== "incoming-ringing") ||
        (state.callId && state.callId !== action.callId)
      ) {
        return state;
      }
      return {
        ...state,
        phase: "connected",
        callId: action.callId,
        peer: action.peer ?? state.peer,
        livekit: {
          token: action.token,
          roomName: action.roomName,
          maxDurationMinutes: action.maxDurationMinutes,
        },
      };
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
  const [state, dispatch] = useReducer(reducer, IDLE_STATE);

  // Recovery path: a client that (re)connected may have missed the
  // point-in-time rtc:invite/rtc:accepted push (see resyncAfterConnect,
  // which invalidates this query on every WS reconnect).
  const { data: snapshot } = useQuery(activeCallQueryOptions());
  useEffect(() => {
    if (!snapshot || state.phase !== "idle") return;
    if (snapshot.type === "rtc:invite" && snapshot.callerId) {
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
    } else if (
      snapshot.type === "rtc:accepted" &&
      snapshot.token &&
      snapshot.roomName
    ) {
      dispatch({
        type: "ACCEPTED",
        callId: snapshot.callId,
        token: snapshot.token,
        roomName: snapshot.roomName,
        maxDurationMinutes: snapshot.maxDurationMinutes,
        peer: snapshot.peerId
          ? {
              id: snapshot.peerId,
              name: snapshot.peerName ?? "",
              avatarUrl: snapshot.peerAvatarUrl ?? null,
            }
          : undefined,
      });
    }
    // The idle guard above keeps this a no-op once a live call is already
    // being tracked — safe to also re-run on phase changes.
  }, [snapshot, state.phase]);

  useEffect(() => {
    if (!realtime) return;
    const unsubscribers = [
      realtime.subscribe("rtc:ringing", (data) => {
        if (typeof data.callId === "string") {
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
          token: data.token,
          roomName: data.roomName,
          maxDurationMinutes:
            typeof data.maxDurationMinutes === "number"
              ? data.maxDurationMinutes
              : undefined,
        });
      }),
      realtime.subscribe("rtc:rejected", (data) => {
        if (typeof data.callId === "string") {
          dispatch({ type: "ENDED", callId: data.callId, reason: "rejected" });
        }
      }),
      realtime.subscribe("rtc:cancelled", (data) => {
        if (typeof data.callId === "string") {
          dispatch({ type: "ENDED", callId: data.callId, reason: "cancelled" });
        }
      }),
      realtime.subscribe("rtc:hangup", (data) => {
        if (typeof data.callId === "string") {
          dispatch({
            type: "ENDED",
            callId: data.callId,
            reason: typeof data.reason === "string" ? data.reason : "hangup",
          });
        }
      }),
      realtime.subscribe("rtc:missed", (data) => {
        if (typeof data.callId === "string") {
          dispatch({ type: "ENDED", callId: data.callId, reason: "missed" });
        }
      }),
      realtime.subscribe("rtc:call-limit-warning", (data) => {
        if (typeof data.callId === "string") {
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
        dispatch({
          type: "ERROR",
          callId: typeof data.callId === "string" ? data.callId : undefined,
          reason: typeof data.reason === "string" ? data.reason : "error",
        });
      }),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [realtime]);

  const startCall = useCallback(
    (peer: RtcCallPeer, hasVideo: boolean) => {
      if (!realtime || realtime.status !== "open") return;
      dispatch({ type: "START_OUTGOING", peer, hasVideo });
      realtime.send({ type: "rtc:invite", calleeId: peer.id, hasVideo });
    },
    [realtime],
  );

  const acceptCall = useCallback(() => {
    if (!realtime || !state.callId) return;
    realtime.send({ type: "rtc:accept", callId: state.callId });
  }, [realtime, state.callId]);

  const rejectCall = useCallback(() => {
    if (!realtime || !state.callId) return;
    realtime.send({ type: "rtc:reject", callId: state.callId });
    dispatch({ type: "RESET" });
  }, [realtime, state.callId]);

  const cancelCall = useCallback(() => {
    if (!realtime || !state.callId) return;
    realtime.send({ type: "rtc:cancel", callId: state.callId });
    dispatch({ type: "RESET" });
  }, [realtime, state.callId]);

  const hangupCall = useCallback(() => {
    if (!realtime || !state.callId) return;
    realtime.send({ type: "rtc:hangup", callId: state.callId });
    dispatch({ type: "RESET" });
  }, [realtime, state.callId]);

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
