import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/admin/audit_types.dart';

final auditLogsServerProvider =
    Provider((ref) => AuditLogsServer(ref.read(dioProvider)));

class AuditLogsServer {
  final Dio _dio;

  AuditLogsServer(this._dio);

  Future<AuditLogResponse> call([AuditLogParams? params]) async {
    final queryParams =
        params?.toQueryParams() ?? const AuditLogParams().toQueryParams();
    final response = await _dio.get<dynamic>(
      Urls.adminAuditLogs,
      queryParameters: queryParams,
    );
    if (response.data is List) {
      final items = (response.data as List)
          .map((e) => AuditLogEntry.fromJson(e as Map<String, dynamic>))
          .toList();
      return AuditLogResponse(
        items: items,
        total: items.length,
        take: 50,
        skip: 0,
      );
    }
    return AuditLogResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
