import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/billing/address.dart';

final billingAddressActionsProvider =
    Provider((ref) => BillingAddressActions(ref));

class BillingAddressActions {
  final Ref _ref;

  BillingAddressActions(this._ref);

  Future<Map<String, dynamic>> get() async {
    final server = _ref.read(billingAddressServerProvider);
    return server.get();
  }

  Future<void> update(Map<String, dynamic> address) async {
    final server = _ref.read(billingAddressServerProvider);
    await server.update(address);
  }
}
