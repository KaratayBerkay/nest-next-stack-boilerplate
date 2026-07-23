import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/premium/query.dart';
import '../../constants/theme.dart';
import 'growth_stats_section.dart';
import 'premium_handlers.dart';
import 'stats_section.dart';

class PremiumPremiumPage extends ConsumerStatefulWidget {
  final String lang;

  const PremiumPremiumPage({super.key, required this.lang});

  @override
  ConsumerState<PremiumPremiumPage> createState() => _PremiumPremiumPageState();
}

class _PremiumPremiumPageState extends ConsumerState<PremiumPremiumPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.invalidate(premiumStatsProvider);
      ref.invalidate(growthStatsProvider);
    });
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
                onPressed: () => exportStatsCSV(ref, context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          statsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
            data: (stats) => PremiumStatsSection(stats: stats),
          ),
          const SizedBox(height: 24),
          const Text('Growth Stats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          growthAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
            data: (growth) => GrowthStatsSection(growth: growth),
          ),
        ],
      ),
    );
  }
}
