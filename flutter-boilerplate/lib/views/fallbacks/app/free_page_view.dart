import 'package:flutter/material.dart';

import 'app_fallback_base.dart';

class FreeFallbackPage extends StatelessWidget {
  final AppFallbackType type;
  final String? message;
  final VoidCallback? onRetry;

  const FreeFallbackPage({
    super.key,
    required this.type,
    this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    switch (type) {
      case AppFallbackType.notFound:
        return const AppFallbackBase(
          icon: Icons.search_off,
          title: 'Page not found',
          message: 'The page you are looking for does not exist.',
        );
      case AppFallbackType.error:
        return AppFallbackBase(
          icon: Icons.error_outline,
          title: 'Something went wrong',
          message: message ?? 'An unexpected error occurred.',
        );
    }
  }
}
