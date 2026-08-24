class StreamBroadcaster {
  final String id;
  final String? name;
  final String email;
  final String? avatarUrl;

  StreamBroadcaster({
    required this.id,
    this.name,
    required this.email,
    this.avatarUrl,
  });

  factory StreamBroadcaster.fromJson(Map<String, dynamic> json) =>
      StreamBroadcaster(
        id: json['id'] as String,
        name: json['name'] as String?,
        email: json['email'] as String,
        avatarUrl: json['avatarUrl'] as String?,
      );
}

class StreamRoomInfo {
  final String id;
  final String state;
  final DateTime? startedAt;
  final DateTime? endedAt;

  StreamRoomInfo({
    required this.id,
    required this.state,
    this.startedAt,
    this.endedAt,
  });

  factory StreamRoomInfo.fromJson(Map<String, dynamic> json) => StreamRoomInfo(
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

class LiveStream {
  final String id;
  final String title;
  final String slug;
  final bool isLive;
  final int peakViewerCount;
  final int viewerCount;
  final DateTime startedAt;
  final DateTime? endedAt;
  final StreamRoomInfo room;
  final StreamBroadcaster broadcaster;

  LiveStream({
    required this.id,
    required this.title,
    required this.slug,
    required this.isLive,
    required this.peakViewerCount,
    required this.viewerCount,
    required this.startedAt,
    this.endedAt,
    required this.room,
    required this.broadcaster,
  });

  factory LiveStream.fromJson(Map<String, dynamic> json) => LiveStream(
        id: json['id'] as String,
        title: json['title'] as String,
        slug: json['slug'] as String,
        isLive: json['isLive'] as bool,
        peakViewerCount: json['peakViewerCount'] as int,
        viewerCount: json['viewerCount'] as int,
        startedAt: DateTime.parse(json['startedAt'] as String),
        endedAt: json['endedAt'] != null
            ? DateTime.parse(json['endedAt'] as String)
            : null,
        room: StreamRoomInfo.fromJson(json['room'] as Map<String, dynamic>),
        broadcaster: StreamBroadcaster.fromJson(
          json['broadcaster'] as Map<String, dynamic>,
        ),
      );
}

class LiveStreamJoinResult {
  final String token;
  final String roomName;
  final LiveStream stream;

  LiveStreamJoinResult({
    required this.token,
    required this.roomName,
    required this.stream,
  });

  factory LiveStreamJoinResult.fromJson(Map<String, dynamic> json) =>
      LiveStreamJoinResult(
        token: json['token'] as String,
        roomName: json['roomName'] as String,
        stream: LiveStream.fromJson(json['stream'] as Map<String, dynamic>),
      );
}

class StreamChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String? senderAvatarUrl;
  final String text;
  final DateTime createdAt;

  StreamChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    this.senderAvatarUrl,
    required this.text,
    required this.createdAt,
  });

  factory StreamChatMessage.fromJson(Map<String, dynamic> json) =>
      StreamChatMessage(
        id: json['id'] as String,
        senderId: json['senderId'] as String,
        senderName: json['senderName'] as String,
        senderAvatarUrl: json['senderAvatarUrl'] as String?,
        text: json['text'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}

class StreamChatPage {
  final List<StreamChatMessage> messages;
  final bool hasMore;

  StreamChatPage({required this.messages, required this.hasMore});

  factory StreamChatPage.fromJson(Map<String, dynamic> json) => StreamChatPage(
        messages: (json['messages'] as List)
            .map((e) => StreamChatMessage.fromJson(e as Map<String, dynamic>))
            .toList(),
        hasMore: json['hasMore'] as bool,
      );
}
