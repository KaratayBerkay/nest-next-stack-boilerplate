import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/billing/address.dart';
import '../../server/billing/cancel.dart';
import '../../server/billing/remove_payment_method.dart';
import '../../server/billing/set_default_payment_method.dart';
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

  Future<Map<String, dynamic>> subscribe(
    String priceId, {
    String? paymentMethodId,
    String? idempotencyKey,
    String? currency,
  }) async {
    final server = _ref.read(stripeServerProvider);
    return server.subscribe(
      priceId,
      paymentMethodId: paymentMethodId,
      idempotencyKey: idempotencyKey,
      currency: currency,
    );
  }

  Future<void> removePaymentMethod(String paymentMethodId) async {
    final server = _ref.read(removePaymentMethodServerProvider);
    await server.call(paymentMethodId);
  }

  Future<void> setDefaultPaymentMethod(String paymentMethodId) async {
    final server = _ref.read(setDefaultPaymentMethodServerProvider);
    await server.call(paymentMethodId);
  }
}
