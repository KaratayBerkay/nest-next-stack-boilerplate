import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/billing/payment_methods.dart';

final paymentMethodsActionsProvider =
    Provider((ref) => PaymentMethodsActions(ref));

class PaymentMethodsActions {
  final Ref _ref;

  PaymentMethodsActions(this._ref);

  Future<List<PaymentMethod>> list() async {
    final server = _ref.read(paymentMethodsServerProvider);
    return server.call();
  }
}
