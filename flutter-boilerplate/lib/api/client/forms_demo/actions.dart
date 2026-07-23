import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/forms_demo/simulate.dart';

final formSimulateActionsProvider = Provider((ref) => FormSimulateActions(ref));

class FormSimulateActions {
  final Ref _ref;

  FormSimulateActions(this._ref);

  Future<Map<String, dynamic>> simulate(Map<String, dynamic> formData) async {
    final server = _ref.read(formSimulateServerProvider);
    return server.call(formData);
  }
}
