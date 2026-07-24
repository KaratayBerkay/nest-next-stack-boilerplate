import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart' as auth;
import '../../../validators/billing/schema.dart' as billing;
import '../../../validators/forms/schema.dart' as forms;

class FormsCheckoutPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsCheckoutPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsCheckoutPageContent> createState() =>
      _FormsCheckoutPageContentState();
}

class _FormsCheckoutPageContentState
    extends ConsumerState<FormsCheckoutPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _zipCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _zipCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout & Address')),
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
                      'Shipping Address',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    FormTextField(
                      controller: _nameCtrl,
                      label: 'Full Name',
                      validator: auth.validateName,
                    ),
                    const SizedBox(height: 8),
                    FormTextField(
                      controller: _addressCtrl,
                      label: 'Address',
                      validator: (v) => forms.validateRequired(v, 'Address'),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: FormTextField(
                            controller: _cityCtrl,
                            label: 'City',
                            validator: billing.validateCity,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FormTextField(
                            controller: _zipCtrl,
                            label: 'ZIP',
                            validator: billing.validatePostalCode,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Button(
                      child: const Text('Continue to Payment'),
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {}
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
