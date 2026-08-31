import { apiFetchJson } from "@/lib/api-client";
import { ROOMS_URL } from "@/constants/api/urls";

export interface Room {
  slug: string;
}

export async function getRoomsServer(): Promise<Room[]> {
  return apiFetchJson<Room[]>(ROOMS_URL);
}
