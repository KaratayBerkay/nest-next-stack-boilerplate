import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/admin/audit_logs.dart';
import 'package:flutter_boilerplate/types/admin/audit_types.dart';
import 'package:flutter_test/flutter_test.dart';

class _CapturingAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    return ResponseBody.fromString(
      '''
      {"data":{
        "auditLogs":[
          {"id":"log1","action":"admin.tier_changed","level":"INFO",
           "entityType":"User","createdAt":"2026-08-08T00:00:00.000Z"}
        ],
        "auditLogCount": 1
      }}
      ''',
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  group('AuditLogsServer', () {
    test(
      'calls GraphQL auditLogs/auditLogCount, not the nonexistent REST route',
      () async {
        final adapter = _CapturingAdapter();
        final server = AuditLogsServer(Dio()..httpClientAdapter = adapter);

        final result = await server.call(const AuditLogParams(take: 10));

        // The backend never exposed GET /api/admin/audit-logs as a REST
        // route (confirmed by grepping every @Controller in the backend) —
        // the old implementation here 404'd on every call.
        final request = adapter.requests.single;
        expect(request.path, '/graphql');
        final data = request.data as Map<String, dynamic>;
        expect(data['query'] as String, contains('auditLogs('));
        expect(data['query'] as String, contains('auditLogCount('));

        expect(result.items, hasLength(1));
        expect(result.items.first.id, 'log1');
        expect(result.total, 1);
      },
    );

    test('sends a where filter built from action/level/entityType', () async {
      final adapter = _CapturingAdapter();
      final server = AuditLogsServer(Dio()..httpClientAdapter = adapter);

      await server.call(
        const AuditLogParams(action: 'admin.tier_changed', level: 'WARN'),
      );

      final variables = (adapter.requests.single.data
          as Map<String, dynamic>)['variables'] as Map<String, dynamic>;
      final where = variables['where'] as Map<String, dynamic>;
      expect(where['action'], {'equals': 'admin.tier_changed'});
      expect(where['level'], {'equals': 'WARN'});
    });
  });
}
