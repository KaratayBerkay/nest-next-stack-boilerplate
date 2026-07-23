import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/client/billing/query.dart';
import '../api/client/billing/actions.dart';

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

  Future<Map<String, dynamic>> subscribe(String priceId) {
    return _ref.read(billingActionsProvider).subscribe(priceId);
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
