import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class AddressSection extends StatelessWidget {
  const AddressSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Address', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        const Input(label: 'Street Address'),
        const SizedBox(height: 8),
        const Input(label: 'Apt, Suite, etc.'),
        const SizedBox(height: 8),
        const Row(
          children: [
            Expanded(child: Input(label: 'City')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'State')),
          ],
        ),
        const SizedBox(height: 8),
        const Row(
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
