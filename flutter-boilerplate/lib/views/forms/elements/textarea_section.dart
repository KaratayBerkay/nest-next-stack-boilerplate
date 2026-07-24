import 'package:flutter/material.dart';

import '../../../components/ui/textarea/textarea.dart';

class TextareaSection extends StatelessWidget {
  const TextareaSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Textarea(label: 'Default Textarea'),
        const SizedBox(height: 8),
        const Textarea(
          label: 'With Placeholder',
          hintText: 'Type your message here...',
        ),
        const SizedBox(height: 8),
        const Textarea(label: 'With Error', errorText: 'Message is required'),
        const SizedBox(height: 8),
        Textarea(
          label: 'Tall Area',
          controller: TextEditingController(text: 'Some content'),
          minLines: 5,
        ),
        const SizedBox(height: 8),
        const Textarea(label: 'No Label', hintText: 'Enter text...'),
      ],
    );
  }
}
