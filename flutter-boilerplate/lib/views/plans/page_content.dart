import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/currency.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_boilerplate/lib/tier_features.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/billing/query.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';

class PlansPageContent extends ConsumerWidget {
  final String lang;

  const PlansPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final userTier = ref.watch(userTierProvider);

    // Real per-currency amounts once loaded; the ARB pricingPriceX strings
    // (stale, USD-only) are just a same-shape placeholder for the render
    // before the query resolves — mirrors the web's own TIER_PRICES_CENTS
    // placeholder in views/plans/PageContent.tsx.
    final pricesAsync = ref.watch(planPricesProvider);
    final livePrices = pricesAsync.asData?.value;
    String priceFor(String tier, String placeholder) {
      final match =
          livePrices?.where((p) => p.tier.toLowerCase() == tier).firstOrNull;
      if (match == null) return placeholder;
      return formatPrice(match.priceCents, toCurrencyCode(match.currency));
    }

    List<_PlanCard> buildCards(double width) => [
          _PlanCard(
            tier: Tier.free,
            price: priceFor(Tier.free, t.pricingPriceFree),
            features: featuresForTier(t, Tier.free, livePrices),
            color: colors.surfaceAlt,
            userTier: userTier,
            width: width,
          ),
          _PlanCard(
            tier: Tier.basic,
            price: priceFor(Tier.basic, t.pricingPriceBasic),
            features: featuresForTier(t, Tier.basic, livePrices),
            color: colors.info,
            userTier: userTier,
            onSelect: () => context.go('/v1/$lang/checkout/basic'),
            width: width,
          ),
          _PlanCard(
            tier: Tier.medium,
            price: priceFor(Tier.medium, t.pricingPriceMedium),
            features: featuresForTier(t, Tier.medium, livePrices),
            color: colors.brand,
            userTier: userTier,
            onSelect: () => context.go('/v1/$lang/checkout/medium'),
            width: width,
          ),
          _PlanCard(
            tier: Tier.premium,
            price: priceFor(Tier.premium, t.pricingPricePremium),
            features: featuresForTier(t, Tier.premium, livePrices),
            color: colors.warning,
            userTier: userTier,
            isPremium: true,
            onSelect: () => context.go('/v1/$lang/checkout/premium'),
            width: width,
          ),
        ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Text(
            'Choose your plan',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Unlock more features as you grow',
            style: TextStyle(color: colors.fgMuted),
          ),
          const SizedBox(height: 32),
          LayoutBuilder(
            builder: (_, constraints) {
              // Mirrors the web grid's `sm` breakpoint: a single scrollable
              // column on narrow (phone) widths instead of a horizontal
              // carousel that hides cards off-screen with no scroll cue.
              final isMobile = constraints.maxWidth < 768;
              if (isMobile) {
                return Column(
                  children: [
                    for (final card in buildCards(double.infinity)) ...[
                      card,
                      const SizedBox(height: 16),
                    ],
                  ],
                );
              }
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    for (final card in buildCards(220)) ...[
                      card,
                      const SizedBox(width: 16),
                    ],
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String tier;
  final String price;
  final List<String> features;
  final Color color;
  final String userTier;
  final VoidCallback? onSelect;
  final bool isPremium;
  final double width;

  const _PlanCard({
    required this.tier,
    required this.price,
    required this.features,
    required this.color,
    required this.userTier,
    required this.width,
    this.onSelect,
    this.isPremium = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final isCurrent = tier == userTier;
    final included = !isCurrent && Tier.hasAccess(userTier, tier);

    return Container(
      width: width,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isPremium ? color.withValues(alpha: 0.1) : colors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrent ? colors.brand : (isPremium ? color : colors.border),
          width: (isCurrent || isPremium) ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            Tier.displayName(tier),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isPremium ? color : colors.fg,
            ),
          ),
          const SizedBox(height: 8),
          // price already carries its own cadence suffix where one applies
          // (ARB pricingPriceBasic/Medium/Premium = "$9.99/mo" etc.;
          // pricingPriceFree = "$0", no cadence) — no separate "/mo" text.
          Text(
            price,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: isPremium ? color : colors.fg,
            ),
          ),
          const SizedBox(height: 24),
          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Icon(Icons.check, size: 16, color: colors.success),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(f, style: const TextStyle(fontSize: 13)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: isCurrent || included
                ? Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: colors.surfaceAlt,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      isCurrent ? 'Current Plan' : 'Included',
                      style: TextStyle(
                        color: colors.fgMuted,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  )
                : FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: isPremium ? color : null,
                    ),
                    onPressed: onSelect,
                    child: Text(isPremium ? 'Subscribe' : 'Get Started'),
                  ),
          ),
        ],
      ),
    );
  }
}
