"use client";

import { createContext, useContext } from "react";
import type { RealtimeProviderProps } from "@/types/lib/RealtimeProvider-types";
import { type RealtimeStatus } from "./realtime-client";
import { useRealtimeCoordination } from "./useRealtimeCoordination";

type FrameHandler = (data: Record<string, unknown>) => void;

type RealtimeContextValue = {
  status: RealtimeStatus;
  send: (data: Record<string, unknown>) => void;
  subscribe: (type: string, handler: FrameHandler) => () => void;
  watch: (topic: string) => void;
  unwatch: (topic: string) => void;
  registerServices: (services: string[]) => void;
  claimPage: (page: string | null, params?: Record<string, string>) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const value = useRealtimeCoordination();
  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue | null {
  return useContext(RealtimeContext);
}

export function useRealtimeStatus(): RealtimeStatus | null {
  return useRealtime()?.status ?? null;
}
