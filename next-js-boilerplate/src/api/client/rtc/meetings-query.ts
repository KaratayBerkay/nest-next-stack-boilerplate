import { queryOptions } from "@tanstack/react-query";

export function myMeetingsQueryOptions() {
  return queryOptions({
    queryKey: ["rtc", "meetings", "mine"],
    queryFn: async () => {
      const { listMeetingsServer } =
        await import("@/api/server/rtc/meetings/list");
      return listMeetingsServer();
    },
  });
}

export function meetingBySlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["rtc", "meetings", slug],
    queryFn: async () => {
      const { getMeetingServer } =
        await import("@/api/server/rtc/meetings/get");
      return getMeetingServer(slug);
    },
    enabled: Boolean(slug),
  });
}

export function meetingChatQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["rtc", "meetings", slug, "chat"],
    queryFn: async () => {
      const { getMeetingChatServer } =
        await import("@/api/server/rtc/meetings/chat");
      return getMeetingChatServer(slug);
    },
    enabled: Boolean(slug),
  });
}

export function meetingRecordingQueryOptions(slug: string, enabled: boolean) {
  return queryOptions({
    queryKey: ["rtc", "meetings", slug, "recording"],
    queryFn: async () => {
      const { getMeetingRecordingServer } =
        await import("@/api/server/rtc/meetings/recording");
      return getMeetingRecordingServer(slug);
    },
    enabled: Boolean(slug) && enabled,
  });
}
