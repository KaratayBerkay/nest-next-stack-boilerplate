import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/admin/audit_types.dart';
import '../../server/admin/audit_logs.dart';
import '../../server/admin/search_users.dart';

final auditLogsProvider =
    FutureProvider.family((ref, AuditLogParams params) async {
  final server = ref.read(auditLogsServerProvider);
  return server.call(params);
});

final adminSearchUsersProvider =
    FutureProvider.family((ref, String query) async {
  if (query.length < 2) return <AdminUser>[];
  final server = ref.read(adminSearchUsersServerProvider);
  return server.call(query);
});
