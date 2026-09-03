import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/client/billing/actions.dart';
import '../api/client/billing/query.dart';

final billingStateProvider = Provider((ref) => BillingState(ref));

class BillingState {
  final Ref _ref;

  BillingState(this._ref);

  AsyncValue<dynamic>? get subscription => _ref.read(subscriptionProvider);
  AsyncValue<dynamic>? get billingHistory => _ref.read(billingHistoryProvider);
  AsyncValue<dynamic>? get paymentMethods => _ref.read(paymentMethodsProvider);

  Future<Map<String, dynamic>> createSetupIntent() {
    return _ref.read(billingActionsProvider).createSetupIntent();
  }

  Future<Map<String, dynamic>> subscribe(
    String priceId, {
    String? paymentMethodId,
    String? idempotencyKey,
    String? currency,
  }) {
    return _ref.read(billingActionsProvider).subscribe(
          priceId,
          paymentMethodId: paymentMethodId,
          idempotencyKey: idempotencyKey,
          currency: currency,
        );
  }

  /// BE-019: complete a first subscription after the customer passed 3DS.
  Future<Map<String, dynamic>> finalizeSubscription(
    String stripeSubscriptionId,
  ) {
    return _ref
        .read(billingActionsProvider)
        .finalizeSubscription(stripeSubscriptionId);
  }

  Future<void> cancelSubscription() {
    return _ref.read(billingActionsProvider).cancelSubscription();
  }

  void invalidate() {
    _ref.invalidate(subscriptionProvider);
    _ref.invalidate(billingHistoryProvider);
    _ref.invalidate(paymentMethodsProvider);
  }
}
