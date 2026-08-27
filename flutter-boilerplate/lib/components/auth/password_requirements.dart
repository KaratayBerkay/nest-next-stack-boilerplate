import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

/// Mirrors the web app's live password-requirements checklist
/// (`next-js-boilerplate/src/features/auth/ui/PasswordRequirements.tsx`),
/// sourced from the same rule set as
/// `next-js-boilerplate/src/validators/auth/password-policy.ts` /
/// `nest-js-boilerplate/src/auth/password-policy.ts`.
class PasswordRequirements extends StatelessWidget {
  final String password;

  const PasswordRequirements({super.key, required this.password});

  static const _minLength = 8;
  static const _maxLength = 128;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    final rules = <String, bool>{
      t.passwordRuleLength:
          password.length >= _minLength && password.length <= _maxLength,
      t.passwordRuleLowercase: RegExp(r'[a-z]').hasMatch(password),
      t.passwordRuleUppercase: RegExp(r'[A-Z]').hasMatch(password),
      t.passwordRuleNumber: RegExp(r'[0-9]').hasMatch(password),
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          t.passwordRulesHeading,
          style: TextStyle(fontSize: 12, color: colors.fgMuted),
        ),
        const SizedBox(height: 4),
        ...rules.entries.map((entry) {
          final met = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: 2),
            child: Row(
              children: [
                Icon(
                  met ? Icons.check : Icons.close,
                  size: 14,
                  color: met ? colors.success : colors.fgMuted,
                ),
                const SizedBox(width: 6),
                Text(
                  entry.key,
                  style: TextStyle(
                    fontSize: 12,
                    color: met ? colors.success : colors.fgMuted,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}
