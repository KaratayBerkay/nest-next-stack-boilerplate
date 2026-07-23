import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/button/button.dart';

class BillingAddressForm extends StatefulWidget {
  final String? initialLine1;
  final String? initialLine2;
  final String? initialCity;
  final String? initialState;
  final String? initialZip;
  final String? initialCountry;
  final Future<void> Function({
    required String line1,
    String? line2,
    required String city,
    required String state,
    required String zip,
    required String country,
  }) onSave;

  const BillingAddressForm({
    super.key,
    this.initialLine1,
    this.initialLine2,
    this.initialCity,
    this.initialState,
    this.initialZip,
    this.initialCountry,
    required this.onSave,
  });

  @override
  State<BillingAddressForm> createState() => _BillingAddressFormState();
}

class _BillingAddressFormState extends State<BillingAddressForm> {
  late TextEditingController _line1Ctrl;
  late TextEditingController _line2Ctrl;
  late TextEditingController _cityCtrl;
  late TextEditingController _stateCtrl;
  late TextEditingController _zipCtrl;
  late TextEditingController _countryCtrl;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _line1Ctrl = TextEditingController(text: widget.initialLine1 ?? '');
    _line2Ctrl = TextEditingController(text: widget.initialLine2 ?? '');
    _cityCtrl = TextEditingController(text: widget.initialCity ?? '');
    _stateCtrl = TextEditingController(text: widget.initialState ?? '');
    _zipCtrl = TextEditingController(text: widget.initialZip ?? '');
    _countryCtrl = TextEditingController(text: widget.initialCountry ?? '');
  }

  @override
  void dispose() {
    _line1Ctrl.dispose();
    _line2Ctrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    _zipCtrl.dispose();
    _countryCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await widget.onSave(
        line1: _line1Ctrl.text,
        line2: _line2Ctrl.text,
        city: _cityCtrl.text,
        state: _stateCtrl.text,
        zip: _zipCtrl.text,
        country: _countryCtrl.text,
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _line1Ctrl,
          decoration: const InputDecoration(labelText: 'Address Line 1'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _line2Ctrl,
          decoration: const InputDecoration(labelText: 'Address Line 2 (optional)'),
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
                decoration: const InputDecoration(labelText: 'ZIP Code'),
                keyboardType: TextInputType.number,
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
        const SizedBox(height: 16),
        Button(
          fullWidth: true,
          child: Text(_saving ? 'Saving...' : 'Save Address'),
          onPressed: _saving ? null : _save,
        ),
      ],
    );
  }
}
