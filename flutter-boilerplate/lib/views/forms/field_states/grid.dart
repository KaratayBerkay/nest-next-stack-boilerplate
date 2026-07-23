import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class FieldStatesGrid extends StatelessWidget {
  const FieldStatesGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Row(
          children: [
            Expanded(child: Input(label: 'Default')),
            SizedBox(width: 8),
            Expanded(child: Input(label: 'Focused')),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: Input(label: 'With Error', errorText: 'Error')),
            SizedBox(width: 8),
            Expanded(child: Input(label: 'Disabled')),
          ],
        ),
        SizedBox(height: 8),
        Row(
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
