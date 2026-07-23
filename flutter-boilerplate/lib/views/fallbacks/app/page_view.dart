import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../lib/tier_view.dart';
import 'app_fallback_base.dart';
import 'free_page_view.dart';
import 'basic_page_view.dart';
import 'medium_page_view.dart';
import 'premium_page_view.dart';

class FallbackAppContent extends ConsumerWidget {
  final AppFallbackType type;
  final String? message;
  final VoidCallback? onRetry;

  const FallbackAppContent({
    super.key,
    required this.type,
    this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: FreeFallbackPage(
        type: type,
        message: message,
        onRetry: onRetry,
      ),
      basicWidget: BasicFallbackPage(
        type: type,
        message: message,
        onRetry: onRetry,
      ),
      mediumWidget: MediumFallbackPage(
        type: type,
        message: message,
        onRetry: onRetry,
      ),
      premiumWidget: PremiumFallbackPage(
        type: type,
        message: message,
        onRetry: onRetry,
      ),
    );
  }
}
