import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

/// Per-tier feature bullets shown on the checkout summary card. Mirrors the
/// web Plans page's copy (each tier lists its own features, not the next
/// tier's) — see next-js-boilerplate's pricing i18n `featuresFree/Basic/
/// Medium/Premium` for the source of truth this was copied from.
List<String> planSummaryFeaturesFor(String tier) {
  switch (tier.toLowerCase()) {
    case Tier.basic:
      return const [
        'Everything in Free',
        'Priority support',
        'Basic analytics',
      ];
    case Tier.medium:
      return const [
        'Everything in Basic',
        'Post stats & reaction breakdown',
        'VIP room access',
        'Suggested friends',
      ];
    case Tier.premium:
      return const [
        'Everything in Medium',
        'Who-reacted list',
        'Export data',
        'Crown badge',
        'Dedicated support',
      ];
    default:
      return const ['Basic access', 'Community support'];
  }
}

class PlanSummaryCard extends StatelessWidget {
  final String tierLabel;
  final String price;
  final List<String> features;
  final bool alreadySubscribed;

  const PlanSummaryCard({
    super.key,
    required this.tierLabel,
    required this.price,
    this.features = const [],
    this.alreadySubscribed = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            tierLabel,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 4),
          if (alreadySubscribed)
            Text(
              t.checkoutAlreadyOnPlan,
              style: TextStyle(color: colors.fgMuted),
            )
          else
            Text(
              price,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          if (features.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...features.map(
              (f) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Icon(Icons.check, size: 14, color: colors.success),
                    const SizedBox(width: 6),
                    Text(
                      f,
                      style: TextStyle(
                        fontSize: 13,
                        color: colors.fgMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
