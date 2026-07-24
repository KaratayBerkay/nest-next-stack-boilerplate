import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class PlansPageContent extends StatelessWidget {
  final String lang;

  const PlansPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.plansTitle)),
      body: Center(
        child: Padding(
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
              Expanded(
                child: LayoutBuilder(
                  builder: (_, constraints) => SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _PlanCard(
                          tier: Tier.free,
                          price: '\$0',
                          features: const [
                            'Basic feed',
                            '5 messages/day',
                            '1 device',
                          ],
                          color: colors.surfaceAlt,
                          onSelect: () {},
                        ),
                        const SizedBox(width: 16),
                        _PlanCard(
                          tier: Tier.basic,
                          price: '\$9',
                          features: const [
                            'Enhanced feed',
                            '50 messages/day',
                            '3 devices',
                            'Basic stats',
                          ],
                          color: colors.info,
                          onSelect: () =>
                              context.go('/v1/$lang/checkout/basic'),
                        ),
                        const SizedBox(width: 16),
                        _PlanCard(
                          tier: Tier.medium,
                          price: '\$19',
                          features: const [
                            'Full feed',
                            'Unlimited messages',
                            '10 devices',
                            'Analytics',
                            'Priority support',
                          ],
                          color: colors.brand,
                          onSelect: () =>
                              context.go('/v1/$lang/checkout/medium'),
                        ),
                        const SizedBox(width: 16),
                        _PlanCard(
                          tier: Tier.premium,
                          price: '\$49',
                          features: const [
                            'Everything',
                            'Unlimited',
                            'All devices',
                            'AI recommendations',
                            'Video calls',
                            'Dedicated support',
                          ],
                          color: colors.warning,
                          isPremium: true,
                          onSelect: () =>
                              context.go('/v1/$lang/checkout/premium'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String tier;
  final String price;
  final List<String> features;
  final Color color;
  final VoidCallback onSelect;
  final bool isPremium;

  const _PlanCard({
    required this.tier,
    required this.price,
    required this.features,
    required this.color,
    required this.onSelect,
    this.isPremium = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      width: 220,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isPremium ? color.withValues(alpha: 0.1) : colors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isPremium ? color : colors.border,
          width: isPremium ? 2 : 1,
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
          Row(
            textBaseline: TextBaseline.alphabetic,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            children: [
              Text(
                price,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: isPremium ? color : colors.fg,
                ),
              ),
              const SizedBox(width: 4),
              Text('/mo', style: TextStyle(color: colors.fgMuted)),
            ],
          ),
          const SizedBox(height: 16),
          const Spacer(),
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
            child: FilledButton(
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
