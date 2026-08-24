import { queryOptions } from "@tanstack/react-query";

export function liveStreamsQueryOptions() {
  return queryOptions({
    queryKey: ["rtc", "streams", "live"],
    queryFn: async () => {
      const { listLiveStreamsServer } =
        await import("@/api/server/rtc/streams/list");
      return listLiveStreamsServer();
    },
  });
}

export function streamBySlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["rtc", "streams", slug],
    queryFn: async () => {
      const { getStreamServer } = await import("@/api/server/rtc/streams/get");
      return getStreamServer(slug);
    },
    enabled: Boolean(slug),
  });
}

export function streamChatQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["rtc", "streams", slug, "chat"],
    queryFn: async () => {
      const { getStreamChatServer } =
        await import("@/api/server/rtc/streams/chat");
      return getStreamChatServer(slug);
    },
    enabled: Boolean(slug),
  });
}
