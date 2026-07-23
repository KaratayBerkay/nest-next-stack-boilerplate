import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class GrowthStatsSection extends StatelessWidget {
  final dynamic growth;

  const GrowthStatsSection({super.key, required this.growth});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _StatCard(title: 'New Users (Month)', value: '${growth.newUsersThisMonth}', icon: Icons.person_add, color: colors.info),
        _StatCard(title: 'New Subs (Month)', value: '${growth.newSubscriptionsThisMonth}', icon: Icons.trending_up, color: colors.success),
        _StatCard(title: 'Growth Rate', value: '${growth.growthRate.toStringAsFixed(1)}%', icon: Icons.show_chart, color: colors.warning),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return SizedBox(
      width: 160,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 12),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              const SizedBox(height: 4),
              Text(title, style: TextStyle(fontSize: 12, color: colors.fgMuted)),
            ],
          ),
        ),
      ),
    );
  }
}
