import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';
import '../../../components/ui/textarea/textarea.dart';
import '../../../components/ui/button/button.dart';

class ContactForm extends StatelessWidget {
  const ContactForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Expanded(child: Input(label: 'First Name')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'Last Name')),
          ],
        ),
        const SizedBox(height: 8),
        const Input(label: 'Email'),
        const SizedBox(height: 8),
        const Input(label: 'Subject'),
        const SizedBox(height: 8),
        const Textarea(label: 'Message', minLines: 4),
        const SizedBox(height: 16),
        const Button(child: Text('Send Message')),
      ],
    );
  }
}
