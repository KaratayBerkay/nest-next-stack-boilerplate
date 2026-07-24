import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/card/card.dart';
import '../../../constants/theme.dart';

class PlanComparisonCard extends StatelessWidget {
  final String name;
  final String price;
  final String? interval;
  final List<String> features;
  final VoidCallback? onSelect;
  final bool isPopular;
  final String? selectedLabel;
  final Widget? priceSuffix;

  const PlanComparisonCard({
    super.key,
    required this.name,
    required this.price,
    this.interval,
    required this.features,
    this.onSelect,
    this.isPopular = false,
    this.selectedLabel,
    this.priceSuffix,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return CardWidget(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isPopular)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: BoxDecoration(color: colors.brand),
              child: Text(
                'Most Popular',
                style: typography.caption.copyWith(
                  color: colors.surface,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: typography.h4),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(price, style: typography.h2.copyWith(fontSize: 28)),
                    if (interval != null)
                      Padding(
                        padding: const EdgeInsets.only(left: 4),
                        child: Text(
                          '/$interval',
                          style:
                              typography.body.copyWith(color: colors.fgMuted),
                        ),
                      ),
                    if (priceSuffix != null) priceSuffix!,
                  ],
                ),
                const SizedBox(height: 20),
                ...features.map(
                  (feature) => _FeatureRow(
                    feature: feature,
                    colors: colors,
                    typography: typography,
                  ),
                ),
                const SizedBox(height: 24),
                Button(
                  variant:
                      isPopular ? ButtonVariant.primary : ButtonVariant.outline,
                  fullWidth: true,
                  onPressed: onSelect,
                  child: Text(selectedLabel ?? 'Select plan'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  final String feature;
  final AppColors colors;
  final AppTypography typography;

  const _FeatureRow({
    required this.feature,
    required this.colors,
    required this.typography,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(Icons.check_circle_outline, size: 18, color: colors.success),
          const SizedBox(width: 10),
          Expanded(
            child: Text(feature, style: typography.body),
          ),
        ],
      ),
    );
  }
}
