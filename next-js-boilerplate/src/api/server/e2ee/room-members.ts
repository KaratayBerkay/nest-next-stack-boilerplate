import { apiFetchJson } from "@/lib/api-client";
import { E2EE_ROOMS_PREFIX } from "@/constants/api/urls";
import { GET } from "@/constants/api/methods";

export interface RoomMemberEntry {
  userId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
}

export interface RoomMembersResponse {
  membershipVersion: number;
  members: RoomMemberEntry[];
}

export async function fetchRoomMembersServer(
  roomSlug: string,
): Promise<RoomMembersResponse> {
  return apiFetchJson<RoomMembersResponse>(
    `${E2EE_ROOMS_PREFIX}${roomSlug}/members`,
    { method: GET },
  );
}
