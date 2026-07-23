import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class FieldStatesGrid extends StatelessWidget {
  const FieldStatesGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Row(
          children: [
            Expanded(child: Input(label: 'Default')),
            SizedBox(width: 8),
            Expanded(child: Input(label: 'Focused')),
          ],
        ),
        const SizedBox(height: 8),
        const Row(
          children: [
            Expanded(child: Input(label: 'With Error', errorText: 'Error')),
            SizedBox(width: 8),
            Expanded(child: Input(label: 'Disabled')),
          ],
        ),
        const SizedBox(height: 8),
        const Row(
          children: [
            Expanded(child: Input(label: 'Filled')),
            SizedBox(width: 8),
            Expanded(child: Input(label: 'Empty')),
          ],
        ),
      ],
    );
  }
}
