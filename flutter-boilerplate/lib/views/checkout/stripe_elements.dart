import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

import '../../constants/theme.dart';

class StripeElementsConfig extends StatefulWidget {
  final String publishableKey;
  final Widget child;

  const StripeElementsConfig({
    super.key,
    required this.publishableKey,
    required this.child,
  });

  @override
  State<StripeElementsConfig> createState() => _StripeElementsConfigState();
}

class _StripeElementsConfigState extends State<StripeElementsConfig> {
  bool _initialized = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initStripe();
  }

  Future<void> _initStripe() async {
    try {
      Stripe.publishableKey = widget.publishableKey;
      await Stripe.instance.applySettings();
      if (mounted) setState(() => _initialized = true);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
  }

  @override
  void didUpdateWidget(StripeElementsConfig oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.publishableKey != widget.publishableKey) {
      _initialized = false;
      _error = null;
      _initStripe();
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: colors.danger),
              const SizedBox(height: 12),
              Text(
                'Failed to initialize payment system',
                style: TextStyle(
                  color: colors.danger,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _error!,
                style: TextStyle(color: colors.fgMuted, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (!_initialized) {
      return const Center(child: CircularProgressIndicator());
    }

    return widget.child;
  }
}
