import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class PersonalInfoSection extends StatelessWidget {
  const PersonalInfoSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Personal Information',
          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: Input(label: 'First Name')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'Last Name')),
          ],
        ),
        SizedBox(height: 8),
        Input(label: 'Email Address'),
        SizedBox(height: 8),
        Input(label: 'Phone Number'),
      ],
    );
  }
}
