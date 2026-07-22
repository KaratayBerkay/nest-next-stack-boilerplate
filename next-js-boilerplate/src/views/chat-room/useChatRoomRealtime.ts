"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";

export function useChatRoomRealtime(
  room: string,
  setRoomCounts: Dispatch<SetStateAction<Record<string, number>>>,
  setRoomMembers: Dispatch<SetStateAction<{ id: string; name: string; avatar?: string }[]>>,
) {
  const realtime = useRealtime();

  useEffect(() => {
    if (!realtime) return;
    realtime.send({ type: "get-room-counts" });
  }, [realtime]);

  useEffect(() => {
    if (!realtime) return;

    const unsubCounts = realtime.subscribe(
      "room-counts",
      (frame: Record<string, unknown>) => {
        setRoomCounts(frame.rooms as Record<string, number>);
      },
    );

    const unsubJoined = realtime.subscribe(
      "user-joined",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(
            frame.members as { id: string; name: string; avatar?: string }[],
          );
        }
      },
    );

    const unsubLeft = realtime.subscribe(
      "user-left",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(
            frame.members as { id: string; name: string; avatar?: string }[],
          );
        }
      },
    );

    return () => {
      unsubCounts();
      unsubJoined();
      unsubLeft();
    };
  }, [realtime, room]);

  return realtime;
}
