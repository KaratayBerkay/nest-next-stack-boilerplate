import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';
import '../../../components/ui/textarea/textarea.dart';
import '../../../components/ui/checkbox/checkbox.dart';
import '../../../components/ui/switch/switch.dart';
import '../../../components/ui/select/select.dart';
import '../../../components/ui/button/button.dart';
import 'form_builder_utils.dart';

class FormPreview extends StatelessWidget {
  final List<FormFieldConfig> fields;
  final VoidCallback? onSubmit;

  const FormPreview({
    super.key,
    required this.fields,
    this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    if (fields.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(24),
        child: Center(child: Text('No fields yet. Add some fields below.')),
      );
    }

    return Column(
      children: [
        ...fields.map((f) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: _buildField(f),
        )),
        if (onSubmit != null) ...[
          const SizedBox(height: 12),
          Button(onPressed: onSubmit, child: const Text('Submit')),
        ],
      ],
    );
  }

  Widget _buildField(FormFieldConfig field) {
    switch (field.type) {
      case FieldType.text:
      case FieldType.email:
      case FieldType.password:
      case FieldType.number:
        return Input(
          label: field.label,
          hintText: field.hint,
          obscureText: field.type == FieldType.password,
          keyboardType: field.type == FieldType.number ? TextInputType.number : null,
        );
      case FieldType.textarea:
        return Textarea(label: field.label, hintText: field.hint);
      case FieldType.select:
        return SelectWidget(
          label: field.label,
          hintText: field.hint,
          items: field.options ?? [],
        );
      case FieldType.checkbox:
        return CheckboxWidget(value: false, label: field.label);
      case FieldType.switch_:
        return SwitchWidget(value: false, label: field.label);
    }
  }
}
