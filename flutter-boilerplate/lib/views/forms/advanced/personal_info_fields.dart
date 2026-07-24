import 'package:flutter/material.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart' as auth;
import '../../../validators/forms/schema.dart' as forms;

class PersonalInfoFields extends StatelessWidget {
  final TextEditingController nameCtrl;
  final TextEditingController emailCtrl;
  final TextEditingController bioCtrl;

  const PersonalInfoFields({
    super.key,
    required this.nameCtrl,
    required this.emailCtrl,
    required this.bioCtrl,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Personal Info',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        FormTextField(
          controller: nameCtrl,
          label: 'Name',
          validator: auth.validateName,
        ),
        const SizedBox(height: 8),
        FormTextField(
          controller: emailCtrl,
          label: 'Email',
          validator: auth.validateEmail,
        ),
        const SizedBox(height: 8),
        FormTextField(
          controller: bioCtrl,
          label: 'Bio',
          maxLines: 3,
          validator: (v) => forms.validateRequired(v, 'Bio'),
        ),
      ],
    );
  }
}
