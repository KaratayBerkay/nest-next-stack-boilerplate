/// Same frame shapes rtc:invite/rtc:accepted push over the realtime socket
/// — this is a recovery read for a client that (re)connected and may have
/// missed the point-in-time push, not a distinct payload shape of its own.
class ActiveCallSnapshot {
  final String type;
  final String callId;
  final String? callerId;
  final String? callerName;
  final String? callerAvatarUrl;
  final bool? hasVideo;
  final String? peerId;
  final String? peerName;
  final String? peerAvatarUrl;
  final String? token;
  final String? roomName;
  final int? maxDurationMinutes;

  ActiveCallSnapshot({
    required this.type,
    required this.callId,
    this.callerId,
    this.callerName,
    this.callerAvatarUrl,
    this.hasVideo,
    this.peerId,
    this.peerName,
    this.peerAvatarUrl,
    this.token,
    this.roomName,
    this.maxDurationMinutes,
  });

  factory ActiveCallSnapshot.fromJson(Map<String, dynamic> json) =>
      ActiveCallSnapshot(
        type: json['type'] as String,
        callId: json['callId'] as String,
        callerId: json['callerId'] as String?,
        callerName: json['callerName'] as String?,
        callerAvatarUrl: json['callerAvatarUrl'] as String?,
        hasVideo: json['hasVideo'] as bool?,
        peerId: json['peerId'] as String?,
        peerName: json['peerName'] as String?,
        peerAvatarUrl: json['peerAvatarUrl'] as String?,
        token: json['token'] as String?,
        roomName: json['roomName'] as String?,
        maxDurationMinutes: (json['maxDurationMinutes'] as num?)?.toInt(),
      );
}
