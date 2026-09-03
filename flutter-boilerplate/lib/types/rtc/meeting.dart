class MeetingHost {
  final String id;
  final String? name;
  final String email;
  final String? avatarUrl;

  MeetingHost({
    required this.id,
    this.name,
    required this.email,
    this.avatarUrl,
  });

  factory MeetingHost.fromJson(Map<String, dynamic> json) => MeetingHost(
        id: json['id'] as String,
        name: json['name'] as String?,
        email: json['email'] as String,
        avatarUrl: json['avatarUrl'] as String?,
      );
}

class MeetingRoomInfo {
  final String id;
  final String state;
  final DateTime? startedAt;
  final DateTime? endedAt;

  MeetingRoomInfo({
    required this.id,
    required this.state,
    this.startedAt,
    this.endedAt,
  });

  factory MeetingRoomInfo.fromJson(Map<String, dynamic> json) =>
      MeetingRoomInfo(
        id: json['id'] as String,
        state: json['state'] as String,
        startedAt: json['startedAt'] != null
            ? DateTime.parse(json['startedAt'] as String)
            : null,
        endedAt: json['endedAt'] != null
            ? DateTime.parse(json['endedAt'] as String)
            : null,
      );
}

class Meeting {
  final String id;
  final String title;
  final String slug;
  final int maxParticipants;
  final int maxDurationMinutes;
  final DateTime createdAt;
  final MeetingRoomInfo room;
  final MeetingHost host;

  Meeting({
    required this.id,
    required this.title,
    required this.slug,
    required this.maxParticipants,
    required this.maxDurationMinutes,
    required this.createdAt,
    required this.room,
    required this.host,
  });

  factory Meeting.fromJson(Map<String, dynamic> json) => Meeting(
        id: json['id'] as String,
        title: json['title'] as String,
        slug: json['slug'] as String,
        maxParticipants: json['maxParticipants'] as int,
        maxDurationMinutes: json['maxDurationMinutes'] as int,
        createdAt: DateTime.parse(json['createdAt'] as String),
        room: MeetingRoomInfo.fromJson(json['room'] as Map<String, dynamic>),
        host: MeetingHost.fromJson(json['host'] as Map<String, dynamic>),
      );
}

class JoinMeetingResult {
  final String token;
  final String roomName;

  /// Client-facing LiveKit URL from the server; null when it has none
  /// configured (then `AppConfig.livekitUrl` is used — see resolveLivekitUrl).
  final String? livekitUrl;
  final String role;
  final Meeting meeting;

  JoinMeetingResult({
    required this.token,
    required this.roomName,
    this.livekitUrl,
    required this.role,
    required this.meeting,
  });

  factory JoinMeetingResult.fromJson(Map<String, dynamic> json) =>
      JoinMeetingResult(
        token: json['token'] as String,
        roomName: json['roomName'] as String,
        livekitUrl: json['livekitUrl'] as String?,
        role: json['role'] as String,
        meeting: Meeting.fromJson(json['meeting'] as Map<String, dynamic>),
      );
}

class MeetingChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String? senderAvatarUrl;
  final String text;
  final DateTime createdAt;

  MeetingChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    this.senderAvatarUrl,
    required this.text,
    required this.createdAt,
  });

  factory MeetingChatMessage.fromJson(Map<String, dynamic> json) =>
      MeetingChatMessage(
        id: json['id'] as String,
        senderId: json['senderId'] as String,
        senderName: json['senderName'] as String,
        senderAvatarUrl: json['senderAvatarUrl'] as String?,
        text: json['text'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}

class MeetingChatPage {
  final List<MeetingChatMessage> messages;
  final bool hasMore;

  MeetingChatPage({required this.messages, required this.hasMore});

  factory MeetingChatPage.fromJson(Map<String, dynamic> json) =>
      MeetingChatPage(
        messages: (json['messages'] as List)
            .map((e) => MeetingChatMessage.fromJson(e as Map<String, dynamic>))
            .toList(),
        hasMore: json['hasMore'] as bool,
      );
}
