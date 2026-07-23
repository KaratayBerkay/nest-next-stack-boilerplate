import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/card/card.dart';
import '../../../components/ui/card/card_content.dart';
import '../../../components/ui/card/card_header.dart';
import '../../../api/server/billing/subscription.dart';
import '../../../api/client/billing/query.dart';
import '../../../api/client/billing/actions.dart';

class SettingsBillingPageContent extends ConsumerWidget {
  final String lang;

  const SettingsBillingPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subAsync = ref.watch(subscriptionProvider);

    return subAsync.when(
      loading: () => _scaffold(context, const Center(child: CircularProgressIndicator())),
      error: (e, _) => _scaffold(context, Center(child: Text('Error: $e'))),
      data: (sub) {
        if (sub.plan == 'free') return _FreeBillingView(lang: lang);
        return _scaffold(
          context,
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _SubscriptionCard(sub: sub, lang: lang),
              const SizedBox(height: 16),
              _PaymentMethodsSection(),
              const SizedBox(height: 16),
              _InvoiceHistorySection(),
            ],
          ),
        );
      },
    );
  }

  Widget _scaffold(BuildContext context, Widget body) {
    return Scaffold(appBar: AppBar(title: const Text('Billing')), body: body);
  }
}

class _SubscriptionCard extends ConsumerWidget {
  final SubscriptionInfo sub;
  final String lang;

  const _SubscriptionCard({required this.sub, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CardHeader(child: Text('Subscription', style: TextStyle(fontWeight: FontWeight.w600))),
          CardContent(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(sub.plan.toUpperCase(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    Badge(
                      text: sub.status == 'active' ? 'Active' : sub.status,
                      variant: sub.status == 'active' ? BadgeVariant.success : BadgeVariant.warning,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (sub.currentPeriodEnd != null)
                  Text('Renewal date: ${sub.currentPeriodEnd!.toLocal().toString().split(' ')[0]}',
                      style: TextStyle(color: colors.fgMuted, fontSize: 13)),
                if (sub.cancelAtPeriodEnd)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text('Cancels at period end', style: TextStyle(color: colors.warning, fontSize: 13)),
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
                          content: const Text('Your subscription will remain active until the end of the billing period.'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Keep')),
                            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Cancel')),
                          ],
                        ),
                      );
                      if (confirm == true) {
                        await ref.read(billingActionsProvider).cancelSubscription();
                        ref.invalidate(subscriptionProvider);
                        if (context.mounted) context.go('/v1/$lang/plans');
                      }
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentMethodsSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final pmAsync = ref.watch(paymentMethodsProvider);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CardHeader(child: Text('Payment Methods', style: TextStyle(fontWeight: FontWeight.w600))),
          CardContent(
            child: pmAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
              data: (methods) {
                if (methods.isEmpty) {
                  return Column(
                    children: [
                      Text('No payment methods saved.', style: TextStyle(color: colors.fgMuted)),
                      const SizedBox(height: 8),
                      Button(
                        variant: ButtonVariant.outline,
                        child: const Text('Add Card'),
                        onPressed: () => context.go('/v1/en/plans'),
                      ),
                    ],
                  );
                }
                return Column(
                  children: methods.map((pm) => ListTile(
                    leading: Icon(Icons.credit_card, color: colors.brand),
                    title: Text('${pm.brand} •••• ${pm.last4}'),
                    subtitle: Text('Expires ${pm.expMonth}/${pm.expYear}'),
                    trailing: pm.isDefault ? Badge(text: 'Default', variant: BadgeVariant.success) : null,
                  )).toList(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _InvoiceHistorySection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final historyAsync = ref.watch(billingHistoryProvider);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CardHeader(child: Text('Invoices', style: TextStyle(fontWeight: FontWeight.w600))),
          CardContent(
            child: historyAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e', style: TextStyle(color: colors.danger)),
              data: (invoices) {
                if (invoices.isEmpty) {
                  return Text('No invoices yet.', style: TextStyle(color: colors.fgMuted));
                }
                return Column(
                  children: invoices.map((inv) => ListTile(
                    leading: Icon(Icons.receipt, color: colors.fgMuted),
                    title: Text('\$${inv.amount} ${inv.currency.toUpperCase()}'),
                    subtitle: Text(inv.createdAt.toLocal().toString().split(' ')[0]),
                    trailing: Badge(
                      text: inv.status,
                      variant: inv.status == 'paid' ? BadgeVariant.success : BadgeVariant.warning,
                    ),
                    onTap: inv.pdfUrl != null ? () {} : null,
                  )).toList(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FreeBillingView extends StatelessWidget {
  final String lang;

  const _FreeBillingView({required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Billing')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.credit_card_outlined, size: 48, color: colors.fgMuted),
              const SizedBox(height: 16),
              const Text('No billing info yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Upgrade to a paid plan to see billing details.',
                  style: TextStyle(color: colors.fgMuted)),
              const SizedBox(height: 24),
              Button(
                child: const Text('View Plans'),
                onPressed: () => context.go('/v1/$lang/plans'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
