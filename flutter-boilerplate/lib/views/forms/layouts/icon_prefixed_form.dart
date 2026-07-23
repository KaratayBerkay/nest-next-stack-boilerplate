import 'package:flutter/material.dart';

import 'icon_field.dart';

class IconPrefixedForm extends StatelessWidget {
  const IconPrefixedForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const IconField(icon: Icons.person_outline, label: 'Username'),
        const SizedBox(height: 8),
        const IconField(icon: Icons.email_outlined, label: 'Email'),
        const SizedBox(height: 8),
        const IconField(icon: Icons.lock_outline, label: 'Password', obscureText: true),
        const SizedBox(height: 8),
        const IconField(icon: Icons.phone_outlined, label: 'Phone'),
      ],
    );
  }
}
