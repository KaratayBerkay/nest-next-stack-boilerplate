import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';
import '../../../l10n/app_localizations.dart';

class FreeSettingsAccountPage extends ConsumerWidget {
  final String lang;

  const FreeSettingsAccountPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final user = ref.watch(currentUserProvider);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.settingsAccountHeading)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Avatar(name: user?.name ?? 'U', radius: 32),
              const SizedBox(height: 12),
              Text(
                user?.name ?? 'User',
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(
                user?.email ?? '',
                style: TextStyle(color: colors.fgMuted),
              ),
              const SizedBox(height: 24),
              Icon(Icons.lock_outline, size: 48, color: colors.fgMuted),
              const SizedBox(height: 16),
              Text(
                t.settingsAccountFreeHeading,
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              Text(
                t.settingsAccountFreeDescription,
                style: TextStyle(color: colors.fgMuted),
              ),
              const SizedBox(height: 24),
              Button(
                child: Text(t.settingsUpgradePlan),
                onPressed: () {},
              ),
            ],
          ),
        ),
      ),
    );
  }
}
