import 'package:flutter/material.dart';

import 'icon_field.dart';

class IconPrefixedForm extends StatelessWidget {
  const IconPrefixedForm({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        IconField(icon: Icons.person_outline, label: 'Username'),
        SizedBox(height: 8),
        IconField(icon: Icons.email_outlined, label: 'Email'),
        SizedBox(height: 8),
        IconField(
          icon: Icons.lock_outline,
          label: 'Password',
          obscureText: true,
        ),
        SizedBox(height: 8),
        IconField(icon: Icons.phone_outlined, label: 'Phone'),
      ],
    );
  }
}
