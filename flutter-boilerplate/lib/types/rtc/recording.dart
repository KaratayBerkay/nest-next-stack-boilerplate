class RtcRecording {
  final String id;
  final String status;
  final String? fileUrl;
  final DateTime? startedAt;
  final DateTime? endedAt;

  RtcRecording({
    required this.id,
    required this.status,
    this.fileUrl,
    this.startedAt,
    this.endedAt,
  });

  factory RtcRecording.fromJson(Map<String, dynamic> json) => RtcRecording(
        id: json['id'] as String,
        status: json['status'] as String,
        fileUrl: json['fileUrl'] as String?,
        startedAt: json['startedAt'] != null
            ? DateTime.parse(json['startedAt'] as String)
            : null,
        endedAt: json['endedAt'] != null
            ? DateTime.parse(json['endedAt'] as String)
            : null,
      );
}
