import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class TwoColumnGridForm extends StatelessWidget {
  const TwoColumnGridForm({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Row(
          children: [
            Expanded(child: Input(label: 'First Name')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'Last Name')),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: Input(label: 'Email')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'Phone')),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: Input(label: 'City')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'Country')),
          ],
        ),
      ],
    );
  }
}
