import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'package:go_router/go_router.dart';

import '../../app_config.dart';
import '../../components/ui/stripe_card_form.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../hooks/use_billing.dart';
import '../../l10n/app_localizations.dart';
import 'checkout_success_view.dart';
import 'downgrade_section.dart';
import 'plan_summary_card.dart';
import 'stripe_elements.dart';

enum CheckoutChangeType { immediate, scheduled, cancel }

CheckoutChangeType _resolveChangeType(String currentTier, String tier) {
  if (currentTier == Tier.free) return CheckoutChangeType.immediate;
  if (tier == Tier.free) return CheckoutChangeType.cancel;
  return CheckoutChangeType.scheduled;
}

String _formatEffectiveDate(String iso) => iso.split('T').first;

class CheckoutPageContent extends ConsumerStatefulWidget {
  final String lang;
  final String? plan;

  const CheckoutPageContent({super.key, required this.lang, this.plan});

  @override
  ConsumerState<CheckoutPageContent> createState() =>
      _CheckoutPageContentState();
}

class _CheckoutPageContentState extends ConsumerState<CheckoutPageContent> {
  final _nameController = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _cardComplete = false;
  bool _success = false;
  String? _scheduledEffectiveAt;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  String get _tier => Tier.graphQlEnum(widget.plan);

  String get _price {
    switch (widget.plan) {
      case 'basic':
        return '\$9';
      case 'medium':
        return '\$19';
      case 'premium':
        return '\$49';
      default:
        return '\$0';
    }
  }

  bool get _canSubmit => _cardComplete && !_loading && _tier.isNotEmpty;

  Future<void> _handleSubscribe() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final billing = ref.read(billingStateProvider);

      final setupIntent = await billing.createSetupIntent();
      final clientSecret = setupIntent['clientSecret'] as String?;
      if (clientSecret == null) throw Exception('Failed to get client secret');

      await Stripe.instance.confirmSetupIntent(
        paymentIntentClientSecret: clientSecret,
        params: const PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      await billing.subscribe(_tier);
      billing.invalidate();

      if (mounted) {
        setState(() => _success = true);
        _redirectAfter(const Duration(seconds: 2));
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleChange() async {
    if (_loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final billing = ref.read(billingStateProvider);
      final result = await billing.subscribe(_tier);
      billing.invalidate();

      if (mounted) {
        setState(() {
          _scheduledEffectiveAt = result['pendingTierEffectiveAt'] as String?;
          _success = true;
        });
        _redirectAfter(const Duration(seconds: 5));
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _redirectAfter(Duration delay) async {
    await Future<void>.delayed(delay);
    if (mounted) context.go('/v1/${widget.lang}/settings/billing');
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final targetTier = (widget.plan ?? Tier.free).toLowerCase();
    final currentTier = ref.watch(userTierProvider);
    final isCurrent = targetTier == currentTier;
    final changeType = _resolveChangeType(currentTier, targetTier);
    final tierLabel = Tier.displayName(targetTier);

    if (_success) {
      final message = _scheduledEffectiveAt != null
          ? t.checkoutChangeScheduled(
              _formatEffectiveDate(_scheduledEffectiveAt!),
              tierLabel,
            )
          : null;
      return CheckoutSuccessView(
        isDowngrade: changeType == CheckoutChangeType.cancel,
        message: message,
        downgradeMsg: t.checkoutPlanChanged,
        upgradeMsg: t.checkoutUpgradeSuccess,
        redirectingMsg: t.checkoutRedirecting,
      );
    }

    final subtitle = switch (changeType) {
      CheckoutChangeType.immediate => t.checkoutEnterCardDetails,
      CheckoutChangeType.scheduled => t.checkoutScheduledAtRenewal,
      CheckoutChangeType.cancel => t.checkoutChangedImmediately,
    };

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (!isCurrent) ...[
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.checkoutSelectedPlan(tierLabel),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(color: colors.fgMuted),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
        PlanSummaryCard(
          tierLabel: tierLabel,
          price: _price,
          alreadySubscribed: isCurrent,
        ),
        if (!isCurrent) ...[
          const SizedBox(height: 24),
          if (changeType == CheckoutChangeType.immediate) ...[
            Text(
              t.checkoutPaymentMethod,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            StripeElementsConfig(
              publishableKey: AppConfig.stripePublishableKey,
              child: StripeCardFormField(
                nameController: _nameController,
                onCompletionChanged: (complete) =>
                    setState(() => _cardComplete = complete),
              ),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  _error!,
                  style: TextStyle(color: colors.danger, fontSize: 13),
                ),
              ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _canSubmit ? _handleSubscribe : null,
              child: _loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text('${t.checkoutUpgrade} — $_price/month'),
            ),
          ] else ...[
            DowngradeSection(
              error: _error,
              confirmLabel: changeType == CheckoutChangeType.cancel
                  ? t.checkoutConfirmDowngrade(tierLabel)
                  : t.checkoutConfirmChange(tierLabel),
              onConfirm: _handleChange,
            ),
          ],
        ],
      ],
    );
  }
}
