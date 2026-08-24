export function useStreamActions() {
  const goLive = async (title: string) => {
    const { goLiveServer } = await import("@/api/server/rtc/streams/go-live");
    return goLiveServer(title);
  };

  const joinStream = async (slug: string) => {
    const { joinStreamServer } = await import("@/api/server/rtc/streams/join");
    return joinStreamServer(slug);
  };

  const leaveStream = async (slug: string) => {
    const { leaveStreamServer } =
      await import("@/api/server/rtc/streams/leave");
    return leaveStreamServer(slug);
  };

  const endStream = async (slug: string) => {
    const { endStreamServer } = await import("@/api/server/rtc/streams/end");
    return endStreamServer(slug);
  };

  return { goLive, joinStream, leaveStream, endStream };
}
