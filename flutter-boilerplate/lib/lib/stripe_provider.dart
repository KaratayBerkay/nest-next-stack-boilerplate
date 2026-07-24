import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import '../app_config.dart';

final stripeInitProvider = Provider((_) {
  if (kIsWeb) return false;
  Stripe.publishableKey = AppConfig.stripePublishableKey;
  Stripe.merchantIdentifier = 'merchant.com.flutterboilerplate';
  Stripe.urlScheme = 'flutterstripe';
  return true;
});
