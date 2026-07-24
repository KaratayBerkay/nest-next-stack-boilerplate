import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class AuthFormWrapper extends StatelessWidget {
  final Widget? logo;
  final String title;
  final String? subtitle;
  final Widget? socialButtons;
  final Widget child;
  final double maxWidth;

  const AuthFormWrapper({
    super.key,
    this.logo,
    required this.title,
    this.subtitle,
    this.socialButtons,
    required this.child,
    this.maxWidth = 400,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxWidth),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (logo != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: Center(child: logo),
                ),
              Text(
                title,
                style: typography.h2,
                textAlign: TextAlign.center,
              ),
              if (subtitle != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 24),
                  child: Text(
                    subtitle!,
                    style: typography.body.copyWith(color: colors.fgMuted),
                    textAlign: TextAlign.center,
                  ),
                ),
              if (socialButtons != null) ...[
                socialButtons!,
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Row(
                    children: [
                      Expanded(child: Divider(color: colors.border)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'or',
                          style: typography.caption
                              .copyWith(color: colors.fgMuted),
                        ),
                      ),
                      Expanded(child: Divider(color: colors.border)),
                    ],
                  ),
                ),
              ],
              child,
            ],
          ),
        ),
      ),
    );
  }
}
