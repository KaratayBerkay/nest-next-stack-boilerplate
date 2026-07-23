import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/premium/query.dart';
import '../../constants/theme.dart';

class PremiumPageContent extends ConsumerWidget {
  final String lang;

  const PremiumPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const TierGate(
      freeWidget: _FreePremiumView(),
      basicWidget: _BasicPremiumView(),
      mediumWidget: _MediumPremiumView(),
      premiumWidget: _PremiumPremiumView(),
    );
  }
}

class _FreePremiumView extends StatelessWidget {
  const _FreePremiumView();

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.workspace_premium, size: 64, color: colors.warning),
            const SizedBox(height: 16),
            const Text(
              'Upgrade to Premium',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Get access to exclusive features and insights.',
              style: TextStyle(color: colors.fgMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.arrow_forward),
              label: const Text('View Plans'),
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.brand,
                foregroundColor: colors.fg,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BasicPremiumView extends ConsumerStatefulWidget {
  const _BasicPremiumView();

  @override
  ConsumerState<_BasicPremiumView> createState() => _BasicPremiumViewState();
}

class _BasicPremiumViewState extends ConsumerState<_BasicPremiumView> {
  bool _loaded = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final statsAsync = ref.watch(premiumStatsProvider);

    if (!_loaded) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Load stats to see premium insights'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => setState(() => _loaded = true),
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.brand,
                foregroundColor: colors.fg,
              ),
              child: const Text('Load Stats'),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(16),
      child: statsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e', style: TextStyle(color: colors.danger))),
        data: (stats) => _StatsGrid(stats: stats),
      ),
    );
  }
}

class _MediumPremiumView extends ConsumerStatefulWidget {
  const _MediumPremiumView();

  @override
  ConsumerState<_MediumPremiumView> createState() => _MediumPremiumViewState();
}

class _MediumPremiumViewState extends ConsumerState<_MediumPremiumView> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.invalidate(premiumStatsProvider));
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final statsAsync = ref.watch(premiumStatsProvider);
    final growthAsync = ref.watch(growthStatsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(premiumStatsProvider);
        ref.invalidate(growthStatsProvider);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Premium Stats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          statsAsync.when(
            loading: () => const _StatsLoadingRow(),
            error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
            data: (stats) => _StatsGrid(stats: stats),
          ),
          const SizedBox(height: 24),
          const Text('Growth Stats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          growthAsync.when(
            loading: () => const _StatsLoadingRow(),
            error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
            data: (growth) => _GrowthStatsGrid(growth: growth),
          ),
        ],
      ),
    );
  }
}

class _PremiumPremiumView extends ConsumerStatefulWidget {
  const _PremiumPremiumView();

  @override
  ConsumerState<_PremiumPremiumView> createState() => _PremiumPremiumViewState();
}

class _PremiumPremiumViewState extends ConsumerState<_PremiumPremiumView> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.invalidate(premiumStatsProvider);
      ref.invalidate(growthStatsProvider);
    });
  }

  void _exportCSV() {
    final stats = ref.read(premiumStatsProvider).asData?.value;
    final growth = ref.read(growthStatsProvider).asData?.value;
    if (stats == null || growth == null) return;

    final csv = StringBuffer()
      ..writeln('Metric,Value')
      ..writeln('Total Users,${stats.totalUsers}')
      ..writeln('Active Subscriptions,${stats.activeSubscriptions}')
      ..writeln('Monthly Revenue,\$${stats.monthlyRevenue}')
      ..writeln('New Users This Month,${growth.newUsersThisMonth}')
      ..writeln('New Subscriptions This Month,${growth.newSubscriptionsThisMonth}')
      ..writeln('Growth Rate,${growth.growthRate}%');

    Clipboard.setData(ClipboardData(text: csv.toString()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('CSV content copied to clipboard')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final statsAsync = ref.watch(premiumStatsProvider);
    final growthAsync = ref.watch(growthStatsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(premiumStatsProvider);
        ref.invalidate(growthStatsProvider);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              const Expanded(child: Text('Premium Stats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
              IconButton(
                icon: Icon(Icons.download, color: colors.brand),
                tooltip: 'Export CSV',
                onPressed: _exportCSV,
              ),
            ],
          ),
          const SizedBox(height: 12),
          statsAsync.when(
            loading: () => const _StatsLoadingRow(),
            error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
            data: (stats) => _StatsGrid(stats: stats),
          ),
          const SizedBox(height: 24),
          const Text('Growth Stats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          growthAsync.when(
            loading: () => const _StatsLoadingRow(),
            error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
            data: (growth) => _GrowthStatsGrid(growth: growth),
          ),
        ],
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final dynamic stats;

  const _StatsGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _StatCard(title: 'Total Users', value: '${stats.totalUsers}', icon: Icons.people, color: colors.brand),
        _StatCard(title: 'Active Subs', value: '${stats.activeSubscriptions}', icon: Icons.subscriptions, color: colors.success),
        _StatCard(title: 'Monthly Revenue', value: '\$${stats.monthlyRevenue.toStringAsFixed(0)}', icon: Icons.attach_money, color: colors.warning),
      ],
    );
  }
}

class _GrowthStatsGrid extends StatelessWidget {
  final dynamic growth;

  const _GrowthStatsGrid({required this.growth});

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

class _StatsLoadingRow extends StatelessWidget {
  const _StatsLoadingRow();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: CircularProgressIndicator(),
      ),
    );
  }
}
