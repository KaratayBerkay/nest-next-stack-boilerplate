import 'package:flutter/material.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../constants/theme.dart';

class MessageStep extends StatelessWidget {
  final TextEditingController messageCtrl;

  const MessageStep({super.key, required this.messageCtrl});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Personal Message (Optional)',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Add a personal note to your invitation',
          style: TextStyle(color: colors.fgMuted, fontSize: 13),
        ),
        const SizedBox(height: 12),
        FormTextField(
          controller: messageCtrl,
          label: 'Message',
          hint: 'Hey, I\'d love for you to join our team!',
          maxLines: 4,
        ),
      ],
    );
  }
}
