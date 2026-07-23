import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import 'app_fallback_base.dart';

class MediumFallbackPage extends StatelessWidget {
  final AppFallbackType type;
  final String? message;
  final VoidCallback? onRetry;

  const MediumFallbackPage({
    super.key,
    required this.type,
    this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    switch (type) {
      case AppFallbackType.notFound:
        return AppFallbackBase(
          icon: Icons.search_off_rounded,
          title: 'Page not found',
          message: message ?? 'The page you requested could not be found. It may have been removed or the link may be broken.',
          action: onRetry != null
              ? Button(
                  variant: ButtonVariant.primary,
                  onPressed: onRetry,
                  child: const Text('Return home'),
                )
              : null,
        );
      case AppFallbackType.error:
        return AppFallbackBase(
          icon: Icons.error_outline_rounded,
          title: 'Something went wrong',
          message: message ?? 'We encountered an error while processing your request. Please try again.',
          action: onRetry != null
              ? Button(
                  variant: ButtonVariant.primary,
                  onPressed: onRetry,
                  child: const Text('Retry'),
                )
              : null,
        );
    }
  }
}
