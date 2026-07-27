import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/billing/query.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import '../../../fallbacks/index.dart';
import 'plan_advantages.dart';
import 'plan_info_card.dart';
import 'settings_shell.dart';
import 'upgrade_actions.dart';

class SettingsPageContent extends ConsumerWidget {
  final String lang;

  const SettingsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final tier = ref.watch(userTierProvider);
    final subAsync = ref.watch(subscriptionProvider);

    return SettingsShellScaffold(
      lang: lang,
      child: Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.go('/v1/$lang/feed'),
              ),
              const SizedBox(width: 8),
              Text(
                t.settingsSettingsSectionLabel,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const Spacer(),
            ],
          ),
        ),
        Expanded(
          child: ListView(
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
                    child: Icon(
                      Icons.info_outline,
                      size: 18,
                      color: colors.fgMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              subAsync.when(
                loading: () => const SettingsLoadingFallback(),
                error: (_, __) => PlanInfoCard(
                  planName: tier.toUpperCase(),
                  status: 'active',
                  price: tier == 'free' ? 'Free' : null,
                ),
                data: (sub) => PlanInfoCard(
                  planName: sub.plan.toUpperCase(),
                  status: sub.status,
                  renewalDate: sub.currentPeriodEnd
                      ?.toLocal()
                      .toString()
                      .split(' ')[0],
                  cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                  price: tier == 'free' || sub.plan == 'free' ? 'Free' : null,
                ),
              ),
              const SizedBox(height: 12),
              PlanAdvantages(
                advantages: _featuresForTier(t, tier),
              ),
              const SizedBox(height: 12),
              UpgradeActions(
                lang: lang,
                isOnPaidPlan: tier != 'free',
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => context.go('/v1/$lang/settings/billing'),
                child: const Text('Manage Billing'),
              ),
            ],
          ),
        ),
      ],
      ),
    );
  }

  List<String> _featuresForTier(AppLocalizations t, String tier) {
    switch (tier) {
      case 'basic':
        return [
          t.pricingFeaturesBasic0,
          t.pricingFeaturesBasic1,
        ];
      case 'medium':
        return [
          t.pricingFeaturesMedium0,
          t.pricingFeaturesMedium1,
          t.pricingFeaturesMedium2,
        ];
      case 'premium':
        return [
          t.pricingFeaturesPremium0,
          t.pricingFeaturesPremium1,
          t.pricingFeaturesPremium2,
          t.pricingFeaturesPremium3,
        ];
      case 'pro':
        return [
          t.pricingFeaturesPro0,
          t.pricingFeaturesPro1,
          t.pricingFeaturesPro2,
          t.pricingFeaturesPro3,
          t.pricingFeaturesPro4,
        ];
      default:
        return [
          t.pricingFeaturesBasic0,
        ];
    }
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
