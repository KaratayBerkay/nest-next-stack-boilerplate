import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/billing/address.dart';
import '../../server/billing/cancel.dart';
import '../../server/billing/stripe.dart';

final billingActionsProvider = Provider((ref) => BillingActions(ref));

class BillingActions {
  final Ref _ref;

  BillingActions(this._ref);

  Future<void> cancelSubscription() async {
    final server = _ref.read(billingCancelServerProvider);
    await server.call();
  }

  Future<void> updateAddress(Map<String, dynamic> address) async {
    final server = _ref.read(billingAddressServerProvider);
    await server.update(address);
  }

  Future<Map<String, dynamic>> createSetupIntent() async {
    final server = _ref.read(stripeServerProvider);
    return server.createSetupIntent();
  }

  Future<Map<String, dynamic>> subscribe(String priceId) async {
    final server = _ref.read(stripeServerProvider);
    return server.subscribe(priceId);
  }
}
