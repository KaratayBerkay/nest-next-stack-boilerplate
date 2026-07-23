class FriendInvite {
  final String id;
  final String inviteCode;
  final String? inviteLink;
  final int remainingUses;
  final DateTime createdAt;
  final DateTime? expiresAt;

  const FriendInvite({
    required this.id,
    required this.inviteCode,
    this.inviteLink,
    this.remainingUses = 0,
    required this.createdAt,
    this.expiresAt,
  });

  factory FriendInvite.fromJson(Map<String, dynamic> json) {
    return FriendInvite(
      id: json['id'] as String,
      inviteCode: json['inviteCode'] as String,
      inviteLink: json['inviteLink'] as String?,
      remainingUses: json['remainingUses'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'inviteCode': inviteCode,
        'inviteLink': inviteLink,
        'remainingUses': remainingUses,
        'createdAt': createdAt.toIso8601String(),
        'expiresAt': expiresAt?.toIso8601String(),
      };
}
