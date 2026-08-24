const String meetingFields = '''
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
''';
