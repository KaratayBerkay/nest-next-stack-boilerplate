import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class DefaultInputsSection extends StatelessWidget {
  const DefaultInputsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Input(label: 'Default Input'),
        const SizedBox(height: 8),
        const Input(label: 'With Placeholder', hintText: 'Enter something...'),
        const SizedBox(height: 8),
        const Input(label: 'With Error', errorText: 'This field is required'),
        const SizedBox(height: 8),
        Input(label: 'Disabled', controller: TextEditingController(text: 'read only')),
        const SizedBox(height: 8),
        const Input(label: 'With Icon', prefixIcon: Icon(Icons.search)),
        const SizedBox(height: 8),
        const Input(label: 'Password', obscureText: true),
        const SizedBox(height: 8),
        const Input(label: 'Numeric', keyboardType: TextInputType.number),
        const SizedBox(height: 8),
        const Input(label: 'With Helper', helperText: 'This is a helper message'),
      ],
    );
  }
}
