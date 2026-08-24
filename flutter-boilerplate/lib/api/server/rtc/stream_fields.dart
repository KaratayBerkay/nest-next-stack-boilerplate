const String streamFields = '''
  id
  title
  slug
  isLive
  peakViewerCount
  viewerCount
  startedAt
  endedAt
  room {
    id
    state
    startedAt
    endedAt
  }
  broadcaster {
    id
    name
    email
    avatarUrl
  }
''';
