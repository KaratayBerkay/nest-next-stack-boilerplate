import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../hooks/use_auth.dart';

class FreeSettingsAccountPage extends ConsumerWidget {
  final String lang;

  const FreeSettingsAccountPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Avatar(name: user?.name ?? 'U', radius: 32),
              const SizedBox(height: 12),
              Text(user?.name ?? 'User',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text(user?.email ?? '',
                  style: TextStyle(color: colors.fgMuted)),
              const SizedBox(height: 24),
              Icon(Icons.lock_outline, size: 48, color: colors.fgMuted),
              const SizedBox(height: 16),
              const Text('Upgrade to edit your profile',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              Text('Free accounts have limited profile options.',
                  style: TextStyle(color: colors.fgMuted)),
              const SizedBox(height: 24),
              Button(
                child: const Text('Upgrade Account'),
                onPressed: () {},
              ),
            ],
          ),
        ),
      ),
    );
  }
}
