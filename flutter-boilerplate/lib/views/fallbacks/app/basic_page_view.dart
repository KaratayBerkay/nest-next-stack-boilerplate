import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
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

    switch (type) {
      case AppFallbackType.notFound:
        return AppFallbackBase(
          icon: Icons.search_off,
          title: 'Page not found',
          message: message ??
              'The page you are looking for does not exist or has been moved.',
          action: onRetry != null
              ? TextButton(
                  onPressed: onRetry,
                  child: Text('Go home', style: TextStyle(color: colors.brand)),
                )
              : null,
        );
      case AppFallbackType.error:
        return AppFallbackBase(
          icon: Icons.error_outline,
          title: 'Something went wrong',
          message: message ?? 'An unexpected error occurred. Please try again.',
          action: onRetry != null
              ? TextButton(
                  onPressed: onRetry,
                  child:
                      Text('Try again', style: TextStyle(color: colors.brand)),
                )
              : null,
        );
    }
  }
}
