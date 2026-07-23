import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;
  final double iconSize;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
    this.iconSize = 48,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: iconSize, color: colors.fgMuted),
            const SizedBox(height: 16),
            Text(
              title,
              style: typography.h4.copyWith(color: colors.fg),
              textAlign: TextAlign.center,
            ),
            if (message != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  message!,
                  style: typography.body.copyWith(color: colors.fgMuted),
                  textAlign: TextAlign.center,
                ),
              ),
            if (action != null)
              Padding(
                padding: const EdgeInsets.only(top: 24),
                child: action,
              ),
          ],
        ),
      ),
    );
  }
}
