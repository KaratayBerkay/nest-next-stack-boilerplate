import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/admin/audit_types.dart';

final auditLogsServerProvider =
    Provider((ref) => AuditLogsServer(ref.read(dioProvider)));

// Mirrors next-js-boilerplate's app/api/admin/audit-logs/route.ts. The
// backend only ever exposed this via GraphQL (authorization/audit-log
// resolver.ts's auditLogs/auditLogCount) — there is no and never was a REST
// /api/admin/audit-logs route on the backend; the previous implementation
// here 404'd on every call.
const _query = '''
  query AuditLogs(\$where: AuditLogWhereInput, \$take: Int, \$skip: Int) {
    auditLogs(where: \$where, take: \$take, skip: \$skip) {
      id
      action
      level
      entityType
      entityId
      summary
      ip
      userAgent
      requestId
      correlationId
      createdAt
      before
      after
      actor { id name email }
    }
    auditLogCount(where: \$where)
  }
''';

class AuditLogsServer {
  final Dio _dio;

  AuditLogsServer(this._dio);

  Future<AuditLogResponse> call([AuditLogParams? params]) async {
    final p = params ?? const AuditLogParams();
    final where = <String, dynamic>{};
    if (p.action != null && p.action!.isNotEmpty) {
      where['action'] = {'equals': p.action};
    }
    if (p.level != null && p.level!.isNotEmpty) {
      where['level'] = {'equals': p.level};
    }
    if (p.entityType != null && p.entityType!.isNotEmpty) {
      where['entityType'] = {'contains': p.entityType};
    }

    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query': _query,
        'variables': {
          'where': where.isEmpty ? null : where,
          'take': p.take,
          'skip': p.skip,
        },
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to load audit logs',
      );
    }
    final data = body['data'] as Map<String, dynamic>;
    final items = (data['auditLogs'] as List<dynamic>)
        .map((e) => AuditLogEntry.fromJson(e as Map<String, dynamic>))
        .toList();
    return AuditLogResponse(
      items: items,
      total: data['auditLogCount'] as int? ?? items.length,
      take: p.take,
      skip: p.skip,
    );
  }
}
