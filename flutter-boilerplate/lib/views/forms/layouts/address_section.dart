import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class AddressSection extends StatelessWidget {
  const AddressSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Address', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        SizedBox(height: 8),
        Input(label: 'Street Address'),
        SizedBox(height: 8),
        Input(label: 'Apt, Suite, etc.'),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: Input(label: 'City')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'State')),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(flex: 2, child: Input(label: 'Country')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'ZIP Code')),
          ],
        ),
      ],
    );
  }
}
