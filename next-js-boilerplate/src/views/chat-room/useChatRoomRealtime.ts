"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";

type RoomMemberState = { id: string; name: string; chatNickname?: string };

type RawRoomMember = {
  userId: string;
  name: string;
  chatNickname?: string;
};

function toRoomMembers(members: unknown): RoomMemberState[] {
  return (members as RawRoomMember[]).map((m) => ({
    id: m.userId,
    name: m.name,
    chatNickname: m.chatNickname || undefined,
  }));
}

export function useChatRoomRealtime(
  room: string,
  setRoomCounts: Dispatch<SetStateAction<Record<string, number>>>,
  setRoomMembers: Dispatch<SetStateAction<RoomMemberState[]>>,
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

    // Pull the current member list on mount/room-change instead of relying
    // solely on user-joined/user-left broadcasts: a client that joins a
    // room after someone else is already present never gets a broadcast
    // for that pre-existing member (nothing re-fires on their behalf), and
    // the page-claim's own join can complete and broadcast before this
    // effect has finished subscribing — either way the online list stays
    // stuck on "no one here" until some other join/leave happens to fire.
    const unsubMembers = realtime.subscribe(
      "room-members",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(toRoomMembers(frame.members));
        }
      },
    );
    realtime.send({ type: "get-room-members", room });

    const unsubJoined = realtime.subscribe(
      "user-joined",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(toRoomMembers(frame.members));
        }
      },
    );

    const unsubLeft = realtime.subscribe(
      "user-left",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(toRoomMembers(frame.members));
        }
      },
    );

    return () => {
      unsubCounts();
      unsubMembers();
      unsubJoined();
      unsubLeft();
    };
  }, [realtime, room, setRoomCounts, setRoomMembers]);

  return realtime;
}
