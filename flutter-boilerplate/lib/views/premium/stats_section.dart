import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class PremiumStatsSection extends StatelessWidget {
  final dynamic stats;

  const PremiumStatsSection({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _StatCard(
          title: 'Total Users',
          value: '${stats.totalUsers}',
          icon: Icons.people,
          color: colors.brand,
        ),
        _StatCard(
          title: 'Active Subs',
          value: '${stats.activeSubscriptions}',
          icon: Icons.subscriptions,
          color: colors.success,
        ),
        _StatCard(
          title: 'Monthly Revenue',
          value: '\$${stats.monthlyRevenue.toStringAsFixed(0)}',
          icon: Icons.attach_money,
          color: colors.warning,
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

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
              Text(
                value,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: TextStyle(fontSize: 12, color: colors.fgMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
