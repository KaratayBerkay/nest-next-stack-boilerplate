import 'dart:math';

import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/billing/subscribe_flow.dart';
import 'package:flutter_boilerplate/lib/currency.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'package:go_router/go_router.dart';

import '../../api/client/billing/query.dart';
import '../../app_config.dart';
import '../../components/ui/stripe_card_form.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../hooks/use_billing.dart';
import '../../hooks/use_currency.dart';
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

  // One idempotency key per subscribe attempt: kept across a retry after
  // failure (so the server's dedup can recognize a charge that may have
  // already committed) and only regenerated once an attempt actually
  // succeeds — mirrors the web's retryKeyRef in StripeCardForm.tsx.
  String? _retryKey;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  String get _tier => Tier.graphQlEnum(widget.plan);

  String _generateIdempotencyKey() {
    final bytes = List<int>.generate(16, (_) => Random.secure().nextInt(256));
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }

  /// Same-shape fallback for the render before [planPricesProvider]
  /// resolves — mirrors the web's `TIER_PRICES_CENTS` placeholder in
  /// views/plans/PageContent.tsx.
  String get _placeholderPrice {
    final t = AppLocalizations.of(context);
    switch (widget.plan) {
      case 'basic':
        return t.pricingPriceBasic;
      case 'medium':
        return t.pricingPriceMedium;
      case 'premium':
        return t.pricingPricePremium;
      default:
        return t.pricingPriceFree;
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

      final intentData = await billing.createSetupIntent();
      final clientSecret = intentData['clientSecret'] as String?;
      if (clientSecret == null) throw Exception('Failed to get client secret');

      final confirmedIntent = await Stripe.instance.confirmSetupIntent(
        paymentIntentClientSecret: clientSecret,
        params: const PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      final retryKey = _retryKey ??= _generateIdempotencyKey();
      final initial = await billing.subscribe(
        _tier,
        paymentMethodId: confirmedIntent.paymentMethodId,
        idempotencyKey: retryKey,
        currency: ref.read(currencyProvider),
      );
      // BE-019: a declined card used to fall through here as "success"
      // (the result was never inspected). Check it, and when the bank wants
      // 3DS run the next action on-device, then let the backend provision.
      await completeSubscribeWithAuthentication(
        initial,
        confirm: (clientSecret) => Stripe.instance.handleNextAction(
          clientSecret,
        ),
        finalize: billing.finalizeSubscription,
      );
      _retryKey = null;
      billing.invalidate();

      if (mounted) {
        setState(() => _success = true);
        _redirectAfter(const Duration(seconds: 2));
      }
    } on SubscribeDeclined catch (e) {
      if (mounted) {
        setState(
          () =>
              _error = _declineMessage(AppLocalizations.of(context), e.reason),
        );
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _declineMessage(AppLocalizations t, String reason) {
    switch (reason) {
      case 'insufficient_funds':
        return t.checkoutDeclinedInsufficientFunds;
      case 'declined':
        return t.checkoutDeclinedCard;
      case 'authentication_required':
        return t.checkoutAuthenticationRequired;
      case 'authentication_failed':
        return t.checkoutAuthenticationFailed;
      default:
        return t.checkoutPaymentFailedGeneric;
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
      if (result['success'] != true) {
        throw SubscribeDeclined(result['reason'] as String? ?? 'declined');
      }
      billing.invalidate();

      if (mounted) {
        setState(() {
          _scheduledEffectiveAt = result['pendingTierEffectiveAt'] as String?;
          _success = true;
        });
        _redirectAfter(const Duration(seconds: 5));
      }
    } on SubscribeDeclined catch (e) {
      if (mounted) {
        setState(
          () =>
              _error = _declineMessage(AppLocalizations.of(context), e.reason),
        );
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

    // Real per-currency amount once loaded, so what's charged at submit
    // matches what's shown here — same live source the Plans page reads
    // (views/plans/page_content.dart's priceFor), not the stale ARB
    // placeholder used only before the query resolves.
    final livePrices = ref.watch(planPricesProvider).asData?.value;
    final priceMatch = livePrices
        ?.where((p) => p.tier.toLowerCase() == targetTier)
        .firstOrNull;
    final price = priceMatch == null
        ? _placeholderPrice
        : formatPrice(
            priceMatch.priceCents,
            toCurrencyCode(priceMatch.currency),
          );

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
          price: price,
          features: planSummaryFeaturesFor(targetTier),
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
                  : Text('${t.checkoutUpgrade} — $price'),
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
