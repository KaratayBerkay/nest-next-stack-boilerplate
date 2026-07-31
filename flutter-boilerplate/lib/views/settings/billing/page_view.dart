import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../fallbacks/index.dart';
import '../../../api/client/billing/actions.dart';
import '../../../api/client/billing/query.dart';
import '../../../api/server/billing/address.dart';
import '../../../api/server/billing/subscription.dart';
import '../../../components/ui/accordion/accordion.dart';
import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/card/card.dart';
import '../../../components/ui/card/card_content.dart';
import '../../../components/ui/card/card_header.dart';
import '../../../components/ui/stripe_card_form.dart';
import '../../../components/ui/tabs/tabs.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../settings/billing/billing_address_form.dart';
import '../../settings/billing/billing_info_display.dart';
import '../../settings/billing/invoice_pagination.dart';
import '../settings_shell.dart';

class SettingsBillingPageContent extends ConsumerWidget {
  final String lang;

  const SettingsBillingPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final subAsync = ref.watch(subscriptionProvider);

    return SettingsShellScaffold(
      lang: lang,
      child: subAsync.when(
        loading: () => const SettingsLoadingFallback(),
        error: (e, _) => Center(child: Text(t.notificationLoadFailed)),
        data: (sub) {
          return TabsWidget(
            tabs: [
              Tab(text: t.settingsPlanTab),
              Tab(text: t.settingsInvoices),
            ],
            children: [
              ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _SubscriptionCard(sub: sub, lang: lang),
                  const SizedBox(height: 16),
                  _PlanBenefitsSection(currentTier: sub.plan),
                  const SizedBox(height: 16),
                  _PaymentMethodsSection(),
                  const SizedBox(height: 16),
                  _BillingAddressSection(),
                ],
              ),
              ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _InvoiceHistorySection(),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

List<String> _tierFeatures(AppLocalizations t, String tier) {
  switch (tier) {
    case Tier.basic:
      return [t.pricingFeaturesBasic0, t.pricingFeaturesBasic1];
    case Tier.medium:
      return [
        t.pricingFeaturesMedium0,
        t.pricingFeaturesMedium1,
        t.pricingFeaturesMedium2,
      ];
    case Tier.premium:
      return [
        t.pricingFeaturesPremium0,
        t.pricingFeaturesPremium1,
        t.pricingFeaturesPremium2,
        t.pricingFeaturesPremium3,
      ];
    default:
      return const [];
  }
}

List<({String feature, bool included})> _buildBenefits(
  AppLocalizations t,
  String currentTier,
) {
  final all = <({String feature, bool included})>[];
  final currentTierIndex = Tier.tierOrder[currentTier] ?? 0;

  for (var i = 1; i <= currentTierIndex; i++) {
    final tier = Tier.all[i];
    for (final feature in _tierFeatures(t, tier)) {
      if (!all.any((b) => b.feature == feature)) {
        all.add((feature: feature, included: true));
      }
    }
  }

  final nextTierIndex = currentTierIndex + 1;
  if (nextTierIndex < Tier.all.length) {
    for (final feature in _tierFeatures(t, Tier.all[nextTierIndex])) {
      if (!all.any((b) => b.feature == feature)) {
        all.add((feature: feature, included: false));
      }
    }
  }

  return all;
}

class _PlanBenefitsSection extends ConsumerWidget {
  final String currentTier;

  const _PlanBenefitsSection({required this.currentTier});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final benefits = _buildBenefits(t, currentTier);

    return CardWidget(
      child: AccordionWidget(
        items: [
          AccordionItem(
            title: t.settingsPlanBenefits,
            icon: Icons.checklist,
            content: benefits.isEmpty
                ? Text(
                    t.settingsPlanBenefitsEmpty,
                    style: TextStyle(color: colors.fgMuted, fontSize: 13),
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (final benefit in benefits)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Icon(
                                benefit.included
                                    ? Icons.check_circle
                                    : Icons.cancel,
                                size: 18,
                                color: benefit.included
                                    ? colors.success
                                    : colors.fgMuted,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  benefit.feature,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: benefit.included
                                        ? colors.fg
                                        : colors.fgMuted,
                                    decoration: benefit.included
                                        ? TextDecoration.none
                                        : TextDecoration.lineThrough,
                                  ),
                                ),
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

class _SubscriptionCard extends ConsumerWidget {
  final SubscriptionInfo sub;
  final String lang;

  const _SubscriptionCard({required this.sub, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CardHeader(
            child: Text(
              t.settingsPlanDetails,
              style: const TextStyle(fontWeight: FontWeight.w600),
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
                          ? t.accordionStatusActive
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
                    '${t.settingsRenewalDate}: ${sub.currentPeriodEnd!.toLocal().toString().split(' ')[0]}',
                    style: TextStyle(color: colors.fgMuted, fontSize: 13),
                  ),
                if (sub.cancelAtPeriodEnd)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      sub.currentPeriodEnd != null
                          ? '${t.settingsCancelsOn} ${sub.currentPeriodEnd!.toLocal().toString().split(' ')[0]}'
                          : t.settingsCancelsOn,
                      style: TextStyle(color: colors.warning, fontSize: 13),
                    ),
                  ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    Button(
                      child: Text(t.settingsUpgradePlan),
                      onPressed: () => context.go('/v1/$lang/plans'),
                    ),
                    if (!sub.cancelAtPeriodEnd)
                      Button(
                        variant: ButtonVariant.outline,
                        child: Text(t.settingsCancelSubscription),
                        onPressed: () async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (_) => AlertDialog(
                              title: Text(t.settingsCancelSubscriptionTitle),
                              content: Text(t.settingsCancelSubscriptionBody),
                              actions: [
                                TextButton(
                                  onPressed: () =>
                                      Navigator.pop(context, false),
                                  child: Text(t.settingsKeep),
                                ),
                                FilledButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  child: Text(t.settingsCancelButton),
                                ),
                              ],
                            ),
                          );
                          if (confirm == true) {
                            try {
                              await ref
                                  .read(billingActionsProvider)
                                  .cancelSubscription();
                              ref.invalidate(subscriptionProvider);
                              if (context.mounted) {
                                context.go('/v1/$lang/plans');
                              }
                            } catch (e) {
                              if (context.mounted) {
                                showToast(
                                  context,
                                  t.settingsCancelSubscriptionFailed,
                                );
                              }
                            }
                          }
                        },
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BillingAddressSection extends ConsumerStatefulWidget {
  @override
  ConsumerState<_BillingAddressSection> createState() =>
      _BillingAddressSectionState();
}

class _BillingAddressSectionState
    extends ConsumerState<_BillingAddressSection> {
  Map<String, dynamic>? _address;
  bool _loading = true;
  bool _editing = false;

  @override
  void initState() {
    super.initState();
    _loadAddress();
  }

  Future<void> _loadAddress() async {
    try {
      final server = ref.read(billingAddressServerProvider);
      final addr = await server.get();
      if (mounted) {
        setState(() {
          _address = addr;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _saveAddress(Map<String, dynamic> data) async {
    final t = AppLocalizations.of(context);
    try {
      await ref.read(billingActionsProvider).updateAddress(data);
      if (mounted) {
        setState(() {
          _address = data;
          _editing = false;
        });
        showToast(context, t.settingsSaveSuccess);
      }
    } catch (e) {
      if (mounted) showToast(context, t.settingsSaveFailed);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CardHeader(
            child: Row(
              children: [
                Text(
                  t.settingsBillingInfo,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                if (!_editing)
                  TextButton(
                    onPressed: () => setState(() => _editing = true),
                    child: Text(t.settingsEditAddress),
                  ),
              ],
            ),
          ),
          CardContent(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _editing
                    ? BillingAddressForm(
                        initialData: _address,
                        onSave: _saveAddress,
                      )
                    : _address != null &&
                            (_address!['street'] != null ||
                                _address!['name'] != null)
                        ? BillingInfoDisplay(
                            name: _address!['name'] as String?,
                            email: _address!['email'] as String?,
                            addressLine1: _address!['street'] as String?,
                            city: _address!['city'] as String?,
                            state: _address!['state'] as String?,
                            zip: _address!['zipCode'] as String?,
                            country: _address!['country'] as String?,
                          )
                        : Text(
                            t.settingsBillingAddressEmpty,
                            style: TextStyle(color: colors.fgMuted),
                          ),
          ),
        ],
      ),
    );
  }
}

class _PaymentMethodsSection extends ConsumerStatefulWidget {
  @override
  ConsumerState<_PaymentMethodsSection> createState() =>
      _PaymentMethodsSectionState();
}

class _PaymentMethodsSectionState
    extends ConsumerState<_PaymentMethodsSection> {
  Future<void> _removeMethod(String id) async {
    final t = AppLocalizations.of(context);
    try {
      await ref.read(billingActionsProvider).removePaymentMethod(id);
      ref.invalidate(paymentMethodsProvider);
      if (mounted) showToast(context, t.settingsSaveSuccess);
    } catch (e) {
      if (mounted) showToast(context, t.settingsSaveFailed);
    }
  }

  Future<void> _setDefault(String id) async {
    final t = AppLocalizations.of(context);
    try {
      await ref.read(billingActionsProvider).setDefaultPaymentMethod(id);
      ref.invalidate(paymentMethodsProvider);
      if (mounted) showToast(context, t.settingsSaveSuccess);
    } catch (e) {
      if (mounted) showToast(context, t.settingsSaveFailed);
    }
  }

  Future<void> _showAddCardDialog() async {
    final t = AppLocalizations.of(context);
    final nameCtrl = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t.settingsAddCard),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              StripeCardFormField(
                nameController: nameCtrl,
                onCompletionChanged: (v) {},
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(t.settingsCancelButton),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(t.settingsAddCard),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final setupIntent =
          await ref.read(billingActionsProvider).createSetupIntent();
      final clientSecret = setupIntent['clientSecret'] as String?;
      if (clientSecret == null) throw Exception('Failed to get client secret');

      await Stripe.instance.confirmSetupIntent(
        paymentIntentClientSecret: clientSecret,
        params: const PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      ref.invalidate(paymentMethodsProvider);
      if (mounted) showToast(context, t.settingsSaveSuccess);
    } catch (e) {
      if (mounted) showToast(context, t.settingsSaveFailed);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final pmAsync = ref.watch(paymentMethodsProvider);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CardHeader(
            child: Text(
              t.settingsPaymentMethods,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          CardContent(
            child: pmAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text(
                t.notificationLoadFailed,
                style: TextStyle(color: colors.danger),
              ),
              data: (methods) {
                if (methods.isEmpty) {
                  return Column(
                    children: [
                      Text(
                        t.settingsNoPaymentMethods,
                        style: TextStyle(color: colors.fgMuted),
                      ),
                      const SizedBox(height: 8),
                      Button(
                        variant: ButtonVariant.outline,
                        onPressed: _showAddCardDialog,
                        child: Text(t.settingsAddCard),
                      ),
                    ],
                  );
                }
                return Column(
                  children: [
                    ...methods.map(
                      (pm) => ListTile(
                        leading: Icon(Icons.credit_card, color: colors.brand),
                        title: Text('${pm.brand} •••• ${pm.last4}'),
                        subtitle: Text(
                          'Expires ${pm.expMonth}/${pm.expYear}',
                        ),
                        trailing: pm.isDefault
                            ? Badge(
                                text: t.settingsDefaultBadge,
                                variant: BadgeVariant.success,
                              )
                            : Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  TextButton(
                                    onPressed: () => _setDefault(pm.id),
                                    child: Text(
                                      t.settingsMakeDefault,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () => _removeMethod(pm.id),
                                    child: Text(
                                      t.settingsRemove,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Button(
                      variant: ButtonVariant.outline,
                      onPressed: _showAddCardDialog,
                      child: Text(t.settingsAddCard),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _InvoiceHistorySection extends ConsumerStatefulWidget {
  @override
  ConsumerState<_InvoiceHistorySection> createState() =>
      _InvoiceHistorySectionState();
}

class _InvoiceHistorySectionState
    extends ConsumerState<_InvoiceHistorySection> {
  int _page = 1;
  static const _perPage = 5;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final historyAsync = ref.watch(billingHistoryProvider);

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CardHeader(
            child: Text(
              t.settingsInvoices,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          CardContent(
            child: historyAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text(
                t.notificationLoadFailed,
                style: TextStyle(color: colors.danger),
              ),
              data: (invoices) {
                final totalPages =
                    (invoices.length / _perPage).ceil().clamp(1, 999);
                final start = (_page - 1) * _perPage;
                final pageItems = invoices.skip(start).take(_perPage).toList();

                if (invoices.isEmpty) {
                  return Text(
                    t.settingsNoInvoices,
                    style: TextStyle(color: colors.fgMuted),
                  );
                }
                return Column(
                  children: [
                    ...pageItems.map(
                      (inv) => ListTile(
                        leading: Icon(
                          Icons.receipt,
                          color: colors.fgMuted,
                        ),
                        title: Text(
                          '\$${inv.amount} ${inv.currency.toUpperCase()}',
                        ),
                        subtitle: Text(
                          inv.createdAt.toLocal().toString().split(' ')[0],
                        ),
                        trailing: Badge(
                          text: inv.status,
                          variant: inv.status == 'paid'
                              ? BadgeVariant.success
                              : BadgeVariant.warning,
                        ),
                        onTap: inv.pdfUrl != null
                            ? () => launchUrl(Uri.parse(inv.pdfUrl!))
                            : null,
                      ),
                    ),
                    const SizedBox(height: 8),
                    InvoicePagination(
                      currentPage: _page,
                      totalPages: totalPages,
                      onPrevious:
                          _page > 1 ? () => setState(() => _page--) : null,
                      onNext: _page < totalPages
                          ? () => setState(() => _page++)
                          : null,
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
