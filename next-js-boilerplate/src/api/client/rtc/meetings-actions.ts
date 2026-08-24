export function useMeetingActions() {
  const createMeeting = async (title: string) => {
    const { createMeetingServer } =
      await import("@/api/server/rtc/meetings/create");
    return createMeetingServer(title);
  };

  const joinMeeting = async (slug: string) => {
    const { joinMeetingServer } =
      await import("@/api/server/rtc/meetings/join");
    return joinMeetingServer(slug);
  };

  const leaveMeeting = async (slug: string) => {
    const { leaveMeetingServer } =
      await import("@/api/server/rtc/meetings/leave");
    return leaveMeetingServer(slug);
  };

  const endMeeting = async (slug: string) => {
    const { endMeetingServer } = await import("@/api/server/rtc/meetings/end");
    return endMeetingServer(slug);
  };

  const muteParticipant = async (
    slug: string,
    userId: string,
    muted: boolean,
  ) => {
    const { muteParticipantServer } =
      await import("@/api/server/rtc/meetings/participants");
    return muteParticipantServer(slug, userId, muted);
  };

  const removeParticipant = async (slug: string, userId: string) => {
    const { removeParticipantServer } =
      await import("@/api/server/rtc/meetings/participants");
    return removeParticipantServer(slug, userId);
  };

  return {
    createMeeting,
    joinMeeting,
    leaveMeeting,
    endMeeting,
    muteParticipant,
    removeParticipant,
  };
}
