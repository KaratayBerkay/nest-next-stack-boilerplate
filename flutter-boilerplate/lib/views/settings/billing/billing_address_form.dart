import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class BillingAddressForm extends StatefulWidget {
  final Map<String, dynamic>? initialData;
  final ValueChanged<Map<String, dynamic>> onSave;

  const BillingAddressForm({
    super.key,
    this.initialData,
    required this.onSave,
  });

  @override
  State<BillingAddressForm> createState() => _BillingAddressFormState();
}

class _BillingAddressFormState extends State<BillingAddressForm> {
  late TextEditingController _nameCtrl;
  late TextEditingController _streetCtrl;
  late TextEditingController _cityCtrl;
  late TextEditingController _stateCtrl;
  late TextEditingController _zipCtrl;
  late TextEditingController _countryCtrl;
  late TextEditingController _vatCtrl;

  @override
  void initState() {
    super.initState();
    final d = widget.initialData ?? {};
    _nameCtrl = TextEditingController(text: d['name'] as String? ?? '');
    _streetCtrl = TextEditingController(text: d['street'] as String? ?? '');
    _cityCtrl = TextEditingController(text: d['city'] as String? ?? '');
    _stateCtrl = TextEditingController(text: d['state'] as String? ?? '');
    _zipCtrl = TextEditingController(text: d['zipCode'] as String? ?? '');
    _countryCtrl = TextEditingController(text: d['country'] as String? ?? '');
    _vatCtrl = TextEditingController(text: d['vatNumber'] as String? ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _streetCtrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    _zipCtrl.dispose();
    _countryCtrl.dispose();
    _vatCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    widget.onSave({
      'name': _nameCtrl.text,
      'street': _streetCtrl.text,
      'city': _cityCtrl.text,
      'state': _stateCtrl.text,
      'zipCode': _zipCtrl.text,
      'country': _countryCtrl.text,
      'vatNumber': _vatCtrl.text,
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _nameCtrl,
          decoration: const InputDecoration(labelText: 'Full name'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _streetCtrl,
          decoration: const InputDecoration(labelText: 'Street address'),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _cityCtrl,
                decoration: const InputDecoration(labelText: 'City'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _stateCtrl,
                decoration: const InputDecoration(labelText: 'State'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _zipCtrl,
                decoration: const InputDecoration(labelText: 'ZIP code'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _countryCtrl,
                decoration: const InputDecoration(labelText: 'Country'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _vatCtrl,
          decoration: const InputDecoration(labelText: 'VAT number'),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: _submit,
          style: FilledButton.styleFrom(
            backgroundColor: colors.brand,
          ),
          child: const Text('Save Address'),
        ),
      ],
    );
  }
}
