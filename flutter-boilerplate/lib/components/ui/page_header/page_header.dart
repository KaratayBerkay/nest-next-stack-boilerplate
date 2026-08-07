import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

/// Mirrors next-js-boilerplate's `components/ui/page-header/page-header.tsx`.
/// [asH2] is the Dart-friendly stand-in for the web's `as: "h1" | "h2"` —
/// Flutter has no semantic heading-tag distinction, only the visual size
/// difference that prop actually produces.
class PageHeader extends StatelessWidget {
  final String title;
  final String? description;
  final Widget? actions;
  final bool asH2;

  const PageHeader({
    super.key,
    required this.title,
    this.description,
    this.actions,
    this.asH2 = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: asH2 ? 16 : 18,
                  fontWeight: FontWeight.w600,
                  color: colors.fg,
                ),
              ),
            ),
            if (actions != null) ...[
              const SizedBox(width: 16),
              actions!,
            ],
          ],
        ),
        if (description != null) ...[
          const SizedBox(height: 6),
          Text(
            description!,
            style: TextStyle(fontSize: 13, color: colors.fgMuted),
          ),
        ],
      ],
    );
  }
}
