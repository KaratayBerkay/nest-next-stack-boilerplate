import 'package:flutter/material.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../validators/forms/schema.dart' as forms;

class EditorFormFields extends StatelessWidget {
  final TextEditingController titleCtrl;
  final TextEditingController tagsCtrl;
  final TextEditingController bodyCtrl;

  const EditorFormFields({
    super.key,
    required this.titleCtrl,
    required this.tagsCtrl,
    required this.bodyCtrl,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        FormTextField(
          controller: titleCtrl,
          label: 'Title',
          validator: (v) => forms.validateRequired(v, 'Title'),
        ),
        const SizedBox(height: 12),
        FormTextField(controller: tagsCtrl, label: 'Tags (comma separated)'),
        const SizedBox(height: 12),
        FormTextField(
          controller: bodyCtrl,
          label: 'Content',
          maxLines: 12,
          validator: (v) => forms.validateMinLength(v, 10, 'Content'),
        ),
      ],
    );
  }
}
