import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';
import 'app_fallback_base.dart';

class BasicFallbackPage extends StatelessWidget {
  final AppFallbackType type;
  final String? message;
  final VoidCallback? onRetry;

  const BasicFallbackPage({
    super.key,
    required this.type,
    this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    switch (type) {
      case AppFallbackType.notFound:
        return AppFallbackBase(
          icon: Icons.search_off,
          title: t.errorPageNotFoundTitle,
          message: message ?? t.errorPageMovedMessage,
          action: onRetry != null
              ? TextButton(
                  onPressed: onRetry,
                  child: Text(
                    t.errorBackHome,
                    style: TextStyle(color: colors.brand),
                  ),
                )
              : null,
        );
      case AppFallbackType.error:
        return AppFallbackBase(
          icon: Icons.error_outline,
          title: t.errorSomethingWentWrong,
          message: message ?? t.errorUnexpected,
          action: onRetry != null
              ? TextButton(
                  onPressed: onRetry,
                  child: Text(
                    t.errorTryAgain,
                    style: TextStyle(color: colors.brand),
                  ),
                )
              : null,
        );
    }
  }
}
