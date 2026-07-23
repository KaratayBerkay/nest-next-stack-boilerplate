import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/messages/mark_read.dart';

final markReadActionsProvider = Provider((ref) => MarkReadActions(ref));

class MarkReadActions {
  final Ref _ref;

  MarkReadActions(this._ref);

  Future<void> call(String conversationId) async {
    final server = _ref.read(markReadServerProvider);
    await server.call(conversationId);
  }
}
