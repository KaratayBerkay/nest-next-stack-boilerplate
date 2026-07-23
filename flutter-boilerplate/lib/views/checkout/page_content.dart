import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'package:go_router/go_router.dart';

import '../../components/ui/stripe_card_form.dart';
import '../../components/ui/toast/toast.dart';
import '../../constants/theme.dart';
import '../../hooks/use_billing.dart';

class CheckoutPageContent extends ConsumerStatefulWidget {
  final String lang;
  final String? plan;

  const CheckoutPageContent({super.key, required this.lang, this.plan});

  @override
  ConsumerState<CheckoutPageContent> createState() => _CheckoutPageContentState();
}

class _CheckoutPageContentState extends ConsumerState<CheckoutPageContent> {
  final _nameController = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _cardComplete = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  String get _priceId {
    switch (widget.plan) {
      case 'basic':
        return 'price_basic';
      case 'medium':
        return 'price_medium';
      case 'premium':
        return 'price_premium';
      default:
        return '';
    }
  }

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

  bool get _canSubmit => _cardComplete && !_loading && _priceId.isNotEmpty;

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
        params: const PaymentMethodParams.card(paymentMethodData: PaymentMethodData()),
      );

      await billing.subscribe(_priceId);
      billing.invalidate();

      if (mounted) {
        showToast(context, 'Subscription activated!');
        context.go('/v1/${widget.lang}/settings/billing');
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Selected Plan: ${Tier.displayName(widget.plan ?? 'free')}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),),
                  const SizedBox(height: 4),
                  Text('$_price/month — You are about to upgrade your account.',
                      style: TextStyle(color: colors.fgMuted),),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text('Payment Method', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          StripeCardFormField(
            nameController: _nameController,
            onCompletionChanged: (complete) => setState(() => _cardComplete = complete),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error!, style: TextStyle(color: colors.danger, fontSize: 13)),
            ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _canSubmit ? _handleSubscribe : null,
            child: _loading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text('Subscribe — $_price/month'),
          ),
        ],
      ),
    );
  }
}
