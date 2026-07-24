import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/premium/query.dart';
import '../../l10n/app_localizations.dart';

void exportStatsCSV(WidgetRef ref, BuildContext context) {
  final stats = ref.read(premiumStatsProvider).asData?.value;
  final growth = ref.read(growthStatsProvider).asData?.value;
  if (stats == null || growth == null) return;

  final csv = StringBuffer()
    ..writeln('Metric,Value')
    ..writeln('Total Users,${stats.totalUsers}')
    ..writeln('Active Subscriptions,${stats.activeSubscriptions}')
    ..writeln('Monthly Revenue,\$${stats.monthlyRevenue}')
    ..writeln('New Users This Month,${growth.newUsersThisMonth}')
    ..writeln(
      'New Subscriptions This Month,${growth.newSubscriptionsThisMonth}',
    )
    ..writeln('Growth Rate,${growth.growthRate}%');

  final t = AppLocalizations.of(context);
  Clipboard.setData(ClipboardData(text: csv.toString()));
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(t.premiumCsvCopied)),
  );
}

void refreshPremiumData(WidgetRef ref) {
  ref.invalidate(premiumStatsProvider);
  ref.invalidate(growthStatsProvider);
}
