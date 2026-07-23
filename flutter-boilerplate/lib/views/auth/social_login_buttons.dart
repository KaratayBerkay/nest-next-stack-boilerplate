import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../constants/theme.dart';

class SocialLoginButtons extends ConsumerWidget {
  final void Function(String provider)? onSocialLogin;
  const SocialLoginButtons({super.key, this.onSocialLogin});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    return Column(
      children: [
        OutlinedButton.icon(
          onPressed: () => onSocialLogin?.call('google'),
          icon: const Icon(Icons.g_mobiledata),
          label: const Text('Continue with Google'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 44),
            side: BorderSide(color: colors.border),
          ),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => onSocialLogin?.call('github'),
          icon: const Icon(Icons.code),
          label: const Text('Continue with GitHub'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 44),
            side: BorderSide(color: colors.border),
          ),
        ),
      ],
    );
  }
}
