import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import 'plan_advantages.dart';
import 'plan_info_card.dart';
import 'upgrade_actions.dart';

class SettingsPageContent extends ConsumerWidget {
  final String lang;

  const SettingsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final tier = ref.watch(userTierProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(t.settingsSettingsSectionLabel),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/v1/$lang/feed'),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Text(
                t.settingsCurrentPlan,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: colors.fg,
                ),
              ),
              const Spacer(),
              InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => _showSettingsInfo(context),
                child:
                    Icon(Icons.info_outline, size: 18, color: colors.fgMuted),
              ),
            ],
          ),
          const SizedBox(height: 16),
          PlanInfoCard(
            planName: tier.toUpperCase(),
            status: 'active',
            price: tier == 'free' ? 'Free' : null,
          ),
          const SizedBox(height: 12),
          PlanAdvantages(
            advantages: _featuresForTier(tier),
          ),
          const SizedBox(height: 12),
          UpgradeActions(
            lang: lang,
            isOnPaidPlan: tier != 'free',
          ),
        ],
      ),
    );
  }

  List<String> _featuresForTier(String tier) {
    return [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ];
  }
}

void _showSettingsInfo(BuildContext context) {
  showDialog<void>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(AppLocalizations.of(ctx).settingsSettingsSectionLabel),
      content: const Text('Manage your account settings and preferences.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(),
          child: Text(AppLocalizations.of(ctx).v1ShellClose),
        ),
      ],
    ),
  );
}
