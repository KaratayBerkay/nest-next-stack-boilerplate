import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../l10n/app_localizations.dart';
import '../../../validators/billing/schema.dart' as billing;
import '../../../validators/forms/schema.dart' as forms;

class FormsBillingPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsBillingPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsBillingPageContent> createState() =>
      _FormsBillingPageContentState();
}

class _FormsBillingPageContentState
    extends ConsumerState<FormsBillingPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _cardCtrl = TextEditingController();
  final _expiryCtrl = TextEditingController();
  final _cvcCtrl = TextEditingController();

  @override
  void dispose() {
    _cardCtrl.dispose();
    _expiryCtrl.dispose();
    _cvcCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.formsBillingHeading)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Payment Details',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    FormTextField(
                      controller: _cardCtrl,
                      label: 'Card Number',
                      prefixIcon: const Icon(Icons.credit_card),
                      validator: billing.validateCardholderName,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: FormTextField(
                            controller: _expiryCtrl,
                            label: 'MM/YY',
                            validator: (v) =>
                                forms.validateRequired(v, 'Expiry'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FormTextField(
                            controller: _cvcCtrl,
                            label: 'CVC',
                            validator: (v) => forms.validateRequired(v, 'CVC'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Button(
                      child: Text(t.formsBillingUpdateButton),
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {}
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Billing Summary',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 8),
                  _BillingRow(label: 'Current Plan', value: 'Premium'),
                  _BillingRow(label: 'Next Billing', value: 'Apr 15, 2026'),
                  _BillingRow(label: 'Amount', value: '\$29.99/mo'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BillingRow extends StatelessWidget {
  final String label;
  final String value;

  const _BillingRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
