import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/upload/xhr_single.dart';

final uploadActionsProvider = Provider((ref) => UploadActions(ref));

class UploadActions {
  final Ref _ref;

  UploadActions(this._ref);

  Future<String> upload(String filePath) async {
    final server = _ref.read(uploadServerProvider);
    return server.call(filePath);
  }
}
