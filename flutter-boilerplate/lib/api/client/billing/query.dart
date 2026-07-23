import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/billing/subscription.dart';
import '../../server/billing/history.dart';
import '../../server/billing/payment_methods.dart';

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
