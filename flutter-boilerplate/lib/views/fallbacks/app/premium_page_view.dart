import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../l10n/app_localizations.dart';
import 'app_fallback_base.dart';

class PremiumFallbackPage extends StatelessWidget {
  final AppFallbackType type;
  final String? message;
  final VoidCallback? onRetry;

  const PremiumFallbackPage({
    super.key,
    required this.type,
    this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    switch (type) {
      case AppFallbackType.notFound:
        return AppFallbackBase(
          icon: Icons.explore_off,
          title: 'This page is out of reach',
          message: message ??
              'The page you are looking for does not exist. If you believe this is a mistake, please contact our support team.',
          action: onRetry != null
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Button(
                      fullWidth: true,
                      onPressed: onRetry,
                      child: Text(t.errorBackHome),
                    ),
                    const SizedBox(height: 12),
                    Button(
                      variant: ButtonVariant.outline,
                      fullWidth: true,
                      onPressed: () {},
                      child: Text(t.fallbackContactSupport),
                    ),
                  ],
                )
              : null,
        );
      case AppFallbackType.error:
        return AppFallbackBase(
          icon: Icons.error_rounded,
          title: t.errorSomethingWentWrong,
          message: message ??
              'An unexpected error occurred. Our team has been notified. If the problem persists, please reach out to support.',
          action: onRetry != null
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Button(
                      fullWidth: true,
                      onPressed: onRetry,
                      child: Text(t.errorTryAgain),
                    ),
                    const SizedBox(height: 12),
                    Button(
                      variant: ButtonVariant.outline,
                      fullWidth: true,
                      onPressed: () {},
                      child: Text(t.fallbackContactSupport),
                    ),
                  ],
                )
              : null,
        );
    }
  }
}
