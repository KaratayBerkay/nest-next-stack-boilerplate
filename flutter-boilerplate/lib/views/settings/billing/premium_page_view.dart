import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/billing/actions.dart';
import '../../../api/client/billing/query.dart';
import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/card/card.dart';
import '../../../components/ui/card/card_content.dart';
import '../../../components/ui/card/card_header.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class PremiumSettingsBillingPage extends ConsumerWidget {
  final String lang;

  const PremiumSettingsBillingPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final subAsync = ref.watch(subscriptionProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t.settingsBillingHeading)),
      body: subAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (sub) => ListView(
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
                        Row(
                          children: [
                            Text(
                              sub.plan.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Badge(
                              text: sub.status == 'active'
                                  ? 'Active'
                                  : sub.status,
                              variant: sub.status == 'active'
                                  ? BadgeVariant.success
                                  : BadgeVariant.warning,
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if (sub.currentPeriodEnd != null)
                          Text(
                            'Renewal date: ${sub.currentPeriodEnd!.toLocal().toString().split(' ')[0]}',
                            style:
                                TextStyle(color: colors.fgMuted, fontSize: 13),
                          ),
                        if (sub.cancelAtPeriodEnd)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              'Cancels at period end',
                              style: TextStyle(
                                color: colors.warning,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        const SizedBox(height: 12),
                        if (!sub.cancelAtPeriodEnd)
                          Button(
                            variant: ButtonVariant.outline,
                            child: const Text('Cancel Subscription'),
                            onPressed: () async {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (_) => AlertDialog(
                                  title: const Text('Cancel subscription?'),
                                  content: const Text(
                                    'Your subscription will remain active until the end of the billing period.',
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.pop(context, false),
                                      child: const Text('Keep'),
                                    ),
                                    FilledButton(
                                      onPressed: () =>
                                          Navigator.pop(context, true),
                                      child: const Text('Cancel'),
                                    ),
                                  ],
                                ),
                              );
                              if (confirm == true) {
                                await ref
                                    .read(billingActionsProvider)
                                    .cancelSubscription();
                                ref.invalidate(subscriptionProvider);
                              }
                            },
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
                      'Invoices',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  CardContent(
                    child: Column(
                      children: [
                        Text(
                          'Full invoice history available.',
                          style: TextStyle(color: colors.fgMuted),
                        ),
                        const SizedBox(height: 8),
                        Button(
                          variant: ButtonVariant.ghost,
                          child: const Text('Browse Invoices'),
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
