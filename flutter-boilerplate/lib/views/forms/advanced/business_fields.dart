import 'package:flutter/material.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../validators/forms/schema.dart' as forms;

class BusinessFields extends StatelessWidget {
  final TextEditingController companyCtrl;
  final TextEditingController roleCtrl;
  final TextEditingController industryCtrl;

  const BusinessFields({
    super.key,
    required this.companyCtrl,
    required this.roleCtrl,
    required this.industryCtrl,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Business Info',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        FormTextField(
          controller: companyCtrl,
          label: 'Company',
          validator: (v) => forms.validateRequired(v, 'Company'),
        ),
        const SizedBox(height: 8),
        FormTextField(
          controller: roleCtrl,
          label: 'Job Title',
          validator: (v) => forms.validateRequired(v, 'Job Title'),
        ),
        const SizedBox(height: 8),
        FormTextField(controller: industryCtrl, label: 'Industry'),
      ],
    );
  }
}
