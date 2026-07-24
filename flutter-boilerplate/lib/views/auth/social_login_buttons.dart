import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class SocialLoginButtons extends ConsumerWidget {
  final void Function(String provider)? onSocialLogin;
  const SocialLoginButtons({super.key, this.onSocialLogin});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    return Column(
      children: [
        OutlinedButton.icon(
          onPressed: () => onSocialLogin?.call('google'),
          icon: const Icon(Icons.g_mobiledata),
          label: Text(t.authSocialGoogle),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 44),
            side: BorderSide(color: colors.border),
          ),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => onSocialLogin?.call('github'),
          icon: const Icon(Icons.code),
          label: Text(t.authSocialGitHub),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 44),
            side: BorderSide(color: colors.border),
          ),
        ),
      ],
    );
  }
}
