import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class PersonalInfoSection extends StatelessWidget {
  const PersonalInfoSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Personal Information', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        const Row(
          children: [
            Expanded(child: Input(label: 'First Name')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'Last Name')),
          ],
        ),
        const SizedBox(height: 8),
        const Input(label: 'Email Address'),
        const SizedBox(height: 8),
        const Input(label: 'Phone Number'),
      ],
    );
  }
}
