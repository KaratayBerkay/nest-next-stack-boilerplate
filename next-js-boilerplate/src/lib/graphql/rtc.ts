const MEETING_FIELDS = `
  id
  title
  slug
  maxParticipants
  maxDurationMinutes
  createdAt
  room {
    id
    state
    startedAt
    endedAt
  }
  host {
    id
    name
    email
    avatarUrl
  }
`;

export const MY_MEETINGS_QUERY = `
  query MyMeetings {
    myMeetings {
      ${MEETING_FIELDS}
    }
  }
`;

export const MEETING_BY_SLUG_QUERY = `
  query MeetingBySlug($slug: String!) {
    meetingBySlug(slug: $slug) {
      ${MEETING_FIELDS}
    }
  }
`;

export const CREATE_MEETING_MUTATION = `
  mutation CreateMeeting($title: String!) {
    createMeeting(title: $title) {
      ${MEETING_FIELDS}
    }
  }
`;

export const JOIN_MEETING_MUTATION = `
  mutation JoinMeeting($slug: String!) {
    joinMeeting(slug: $slug) {
      token
      roomName
      role
      meeting {
        ${MEETING_FIELDS}
      }
    }
  }
`;

export const LEAVE_MEETING_MUTATION = `
  mutation LeaveMeeting($slug: String!) {
    leaveMeeting(slug: $slug)
  }
`;

export const END_MEETING_MUTATION = `
  mutation EndMeeting($slug: String!) {
    endMeeting(slug: $slug)
  }
`;

export const REMOVE_MEETING_PARTICIPANT_MUTATION = `
  mutation RemoveMeetingParticipant($slug: String!, $userId: String!) {
    removeMeetingParticipant(slug: $slug, userId: $userId)
  }
`;

export const MUTE_MEETING_PARTICIPANT_MUTATION = `
  mutation MuteMeetingParticipant($slug: String!, $userId: String!, $muted: Boolean!) {
    muteMeetingParticipant(slug: $slug, userId: $userId, muted: $muted)
  }
`;

export const MEETING_CHAT_MESSAGES_QUERY = `
  query MeetingChatMessages($slug: String!, $before: String, $take: Int) {
    meetingChatMessages(slug: $slug, before: $before, take: $take) {
      hasMore
      messages {
        id
        senderId
        senderName
        senderAvatarUrl
        text
        createdAt
      }
    }
  }
`;
