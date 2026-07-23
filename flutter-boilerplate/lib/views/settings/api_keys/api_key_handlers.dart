import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/api_keys/query.dart';
import '../../../api/client/api_keys/actions.dart';
import '../../../components/ui/toast/toast.dart';

final apiKeyHandlersProvider = Provider((ref) {
  return ApiKeyHandlers(ref);
});

class ApiKeyHandlers {
  final Ref ref;

  ApiKeyHandlers(this.ref);

  Future<void> create(BuildContext context, String name) async {
    try {
      await ref.read(apiKeyActionsProvider).create(name);
      ref.invalidate(apiKeysProvider);
      if (context.mounted) showToast(context, 'Key created');
    } catch (e) {
      if (context.mounted) showToast(context, 'Failed: $e');
    }
  }

  Future<void> revoke(BuildContext context, String id) async {
    try {
      await ref.read(apiKeyActionsProvider).revoke(id);
      ref.invalidate(apiKeysProvider);
      if (context.mounted) showToast(context, 'Key revoked');
    } catch (e) {
      if (context.mounted) showToast(context, 'Failed: $e');
    }
  }
}
