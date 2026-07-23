import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../api/client/premium/query.dart';
import 'stats_section.dart';

class BasicPremiumPage extends ConsumerStatefulWidget {
  final String lang;

  const BasicPremiumPage({super.key, required this.lang});

  @override
  ConsumerState<BasicPremiumPage> createState() => _BasicPremiumPageState();
}

class _BasicPremiumPageState extends ConsumerState<BasicPremiumPage> {
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
        data: (stats) => PremiumStatsSection(stats: stats),
      ),
    );
  }
}
