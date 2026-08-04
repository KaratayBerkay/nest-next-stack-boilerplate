import { queryOptions } from "@tanstack/react-query";

export function roomsQueryOptions() {
  return queryOptions({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { getRoomsServer } = await import("@/api/server/messages/rooms");
      return getRoomsServer();
    },
    staleTime: 60_000,
  });
}
