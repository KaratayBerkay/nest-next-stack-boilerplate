class CallHistoryPeer {
  final String id;
  final String name;
  final String? avatarUrl;

  CallHistoryPeer({required this.id, required this.name, this.avatarUrl});

  factory CallHistoryPeer.fromJson(Map<String, dynamic> json) =>
      CallHistoryPeer(
        id: json['id'] as String,
        name: json['name'] as String,
        avatarUrl: json['avatarUrl'] as String?,
      );
}

class CallHistoryEntry {
  final String id;
  final CallHistoryPeer peer;
  final String direction;
  final bool hasVideo;
  final String state;
  final DateTime ringingAt;
  final DateTime? acceptedAt;
  final DateTime? endedAt;
  final String? endReason;

  CallHistoryEntry({
    required this.id,
    required this.peer,
    required this.direction,
    required this.hasVideo,
    required this.state,
    required this.ringingAt,
    this.acceptedAt,
    this.endedAt,
    this.endReason,
  });

  factory CallHistoryEntry.fromJson(Map<String, dynamic> json) =>
      CallHistoryEntry(
        id: json['id'] as String,
        peer: CallHistoryPeer.fromJson(json['peer'] as Map<String, dynamic>),
        direction: json['direction'] as String,
        hasVideo: json['hasVideo'] as bool,
        state: json['state'] as String,
        ringingAt: DateTime.parse(json['ringingAt'] as String),
        acceptedAt: json['acceptedAt'] != null
            ? DateTime.parse(json['acceptedAt'] as String)
            : null,
        endedAt: json['endedAt'] != null
            ? DateTime.parse(json['endedAt'] as String)
            : null,
        endReason: json['endReason'] as String?,
      );
}

class CallHistoryPage {
  final List<CallHistoryEntry> calls;
  final bool hasMore;

  CallHistoryPage({required this.calls, required this.hasMore});

  factory CallHistoryPage.fromJson(Map<String, dynamic> json) =>
      CallHistoryPage(
        calls: (json['calls'] as List)
            .map((e) => CallHistoryEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
        hasMore: json['hasMore'] as bool,
      );
}
