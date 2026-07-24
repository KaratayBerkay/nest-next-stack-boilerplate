import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/card/card.dart';
import '../../../components/ui/card/card_content.dart';
import '../../../components/ui/card/card_header.dart';
import '../../../constants/theme.dart';

class MediumSettingsBillingPage extends ConsumerWidget {
  final String lang;

  const MediumSettingsBillingPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Billing')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CardWidget(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CardHeader(
                  child: Text(
                    'Subscription',
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
                            'MEDIUM',
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
                        'Manage your subscription and payment methods.',
                        style: TextStyle(color: colors.fgMuted, fontSize: 13),
                      ),
                      const SizedBox(height: 12),
                      Button(
                        variant: ButtonVariant.outline,
                        child: const Text('Cancel Subscription'),
                        onPressed: () {},
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
                    'Payment Methods',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                CardContent(
                  child: Text(
                    'No payment methods saved.',
                    style: TextStyle(color: colors.fgMuted),
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
                    'Invoices',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                CardContent(
                  child: Text(
                    'No invoices yet.',
                    style: TextStyle(color: colors.fgMuted),
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
