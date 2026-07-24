class AuditActor {
  final String id;
  final String name;
  final String email;

  const AuditActor({required this.id, required this.name, required this.email});

  factory AuditActor.fromJson(Map<String, dynamic> json) {
    return AuditActor(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
    );
  }
}

class AuditLogEntry {
  final String id;
  final String action;
  final String level;
  final String entityType;
  final String? entityId;
  final String? summary;
  final String? ip;
  final String? userAgent;
  final String? requestId;
  final String? correlationId;
  final DateTime createdAt;
  final Map<String, dynamic>? before;
  final Map<String, dynamic>? after;
  final AuditActor? actor;
  final String? details;

  const AuditLogEntry({
    required this.id,
    required this.action,
    required this.level,
    required this.entityType,
    this.entityId,
    this.summary,
    this.ip,
    this.userAgent,
    this.requestId,
    this.correlationId,
    required this.createdAt,
    this.before,
    this.after,
    this.actor,
    this.details,
  });

  factory AuditLogEntry.fromJson(Map<String, dynamic> json) {
    return AuditLogEntry(
      id: json['id'] as String,
      action: json['action'] as String? ?? '',
      level: json['level'] as String? ?? 'INFO',
      entityType: json['entityType'] as String? ?? '',
      entityId: json['entityId'] as String?,
      summary: json['summary'] as String?,
      ip: json['ip'] as String?,
      userAgent: json['userAgent'] as String?,
      requestId: json['requestId'] as String?,
      correlationId: json['correlationId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      before: json['before'] as Map<String, dynamic>?,
      after: json['after'] as Map<String, dynamic>?,
      actor: json['actor'] != null
          ? AuditActor.fromJson(json['actor'] as Map<String, dynamic>)
          : null,
      details: json['details'] as String?,
    );
  }
}

class AuditLogResponse {
  final List<AuditLogEntry> items;
  final int total;
  final int take;
  final int skip;

  const AuditLogResponse({
    required this.items,
    required this.total,
    required this.take,
    required this.skip,
  });

  factory AuditLogResponse.fromJson(Map<String, dynamic> json) {
    return AuditLogResponse(
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => AuditLogEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      total: json['total'] as int? ?? 0,
      take: json['take'] as int? ?? 50,
      skip: json['skip'] as int? ?? 0,
    );
  }
}

class AuditLogParams {
  final int take;
  final int skip;
  final String? action;
  final String? level;
  final String? entityType;

  const AuditLogParams({
    this.take = 50,
    this.skip = 0,
    this.action,
    this.level,
    this.entityType,
  });

  Map<String, dynamic> toQueryParams() {
    final map = <String, dynamic>{'take': take, 'skip': skip};
    if (action != null && action!.isNotEmpty) map['action'] = action;
    if (level != null && level!.isNotEmpty) map['level'] = level;
    if (entityType != null && entityType!.isNotEmpty) {
      map['entityType'] = entityType;
    }
    return map;
  }
}
