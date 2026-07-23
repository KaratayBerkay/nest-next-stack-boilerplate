import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/input/input.dart';
import '../../../components/ui/textarea/textarea.dart';

class ContactForm extends StatelessWidget {
  const ContactForm({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: Input(label: 'First Name')),
            SizedBox(width: 12),
            Expanded(child: Input(label: 'Last Name')),
          ],
        ),
        SizedBox(height: 8),
        Input(label: 'Email'),
        SizedBox(height: 8),
        Input(label: 'Subject'),
        SizedBox(height: 8),
        Textarea(label: 'Message', minLines: 4),
        SizedBox(height: 16),
        Button(child: Text('Send Message')),
      ],
    );
  }
}
