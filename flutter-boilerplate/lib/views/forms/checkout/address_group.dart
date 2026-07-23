import 'package:flutter/material.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart' as auth;
import '../../../validators/forms/schema.dart' as forms;
import '../../../validators/billing/schema.dart' as billing;

class AddressGroup extends StatelessWidget {
  final TextEditingController nameCtrl;
  final TextEditingController addressCtrl;
  final TextEditingController cityCtrl;
  final TextEditingController zipCtrl;

  const AddressGroup({
    super.key,
    required this.nameCtrl,
    required this.addressCtrl,
    required this.cityCtrl,
    required this.zipCtrl,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Shipping Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        FormTextField(controller: nameCtrl, label: 'Full Name', validator: auth.validateName),
        const SizedBox(height: 8),
        FormTextField(controller: addressCtrl, label: 'Address', validator: (v) => forms.validateRequired(v, 'Address')),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: FormTextField(controller: cityCtrl, label: 'City', validator: billing.validateCity)),
            const SizedBox(width: 12),
            Expanded(child: FormTextField(controller: zipCtrl, label: 'ZIP', validator: billing.validatePostalCode)),
          ],
        ),
      ],
    );
  }
}
