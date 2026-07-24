import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/card/card.dart';
import '../../../components/ui/card/card_content.dart';
import '../../../components/ui/card/card_header.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class BasicSettingsBillingPage extends ConsumerWidget {
  final String lang;

  const BasicSettingsBillingPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.settingsBillingHeading)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CardWidget(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CardHeader(
                  child: Text(
                    'Current Plan',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                CardContent(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Text(
                            'BASIC',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(width: 8),
                          Badge(text: 'Active', variant: BadgeVariant.success),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Your basic plan is active.',
                        style: TextStyle(color: colors.fgMuted, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          CardWidget(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CardHeader(
                  child: Text(
                    'Upgrade',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                CardContent(
                  child: Column(
                    children: [
                      Text(
                        'Unlock payment methods and detailed invoices with a higher tier.',
                        style: TextStyle(color: colors.fgMuted, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
