import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_features.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../fallbacks/index.dart';
import '../../api/client/billing/query.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
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
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
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
                  data: (sub) {
                    String? priceStr;
                    if (tier == 'free' || sub.plan == 'free') {
                      priceStr = 'Free';
                    } else if (sub.priceCents != null && sub.currency != null) {
                      final dollars = sub.priceCents! / 100;
                      priceStr =
                          '\$${dollars.toStringAsFixed(2)}/${sub.currency}';
                    }
                    return PlanInfoCard(
                      planName: sub.plan.toUpperCase(),
                      status: sub.status,
                      renewalDate: sub.currentPeriodEnd
                          ?.toLocal()
                          .toString()
                          .split(' ')[0],
                      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                      price: priceStr,
                    );
                  },
                ),
                const SizedBox(height: 12),
                // CROSS-031: same backend-driven list the Plans page renders.
                PlanAdvantages(
                  advantages: featuresForTier(
                    t,
                    tier,
                    ref.watch(planPricesProvider).asData?.value,
                  ),
                ),
                const SizedBox(height: 12),
                UpgradeActions(
                  lang: lang,
                  isOnPaidPlan: tier != 'free',
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => context.go('/v1/$lang/settings/billing'),
                  child: Text(t.settingsBillingHeading),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

void _showSettingsInfo(BuildContext context) {
  showDialog<void>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(AppLocalizations.of(ctx).settingsSettingsSectionLabel),
      content: Text(AppLocalizations.of(ctx).settingsPageInfoDescription),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(),
          child: Text(AppLocalizations.of(ctx).v1ShellClose),
        ),
      ],
    ),
  );
}
