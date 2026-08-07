import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../hooks/use_currency.dart';
import '../../server/billing/history.dart';
import '../../server/billing/payment_methods.dart';
import '../../server/billing/plan_prices.dart';
import '../../server/billing/subscription.dart';

final subscriptionProvider = FutureProvider<SubscriptionInfo>((ref) async {
  final server = ref.read(subscriptionServerProvider);
  return server.call();
});

final billingHistoryProvider = FutureProvider<List<Invoice>>((ref) async {
  final server = ref.read(billingHistoryServerProvider);
  return server.call();
});

final paymentMethodsProvider = FutureProvider<List<PaymentMethod>>((ref) async {
  final server = ref.read(paymentMethodsServerProvider);
  return server.call();
});

/// Re-fetches whenever the user's currency preference changes (e.g. they
/// change it in Settings, then open Plans) — mirrors the web's
/// `planPricesQueryOptions(currency, userId)`, which keys its query cache
/// on `currency` for the same reason.
final planPricesProvider = FutureProvider<List<PlanPrice>>((ref) async {
  final currency = ref.watch(currencyProvider);
  final server = ref.read(planPricesServerProvider);
  return server.call(currency: currency);
});
