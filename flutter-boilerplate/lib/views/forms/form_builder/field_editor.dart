import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/input/input.dart';
import 'form_builder_utils.dart';

class FieldEditor extends StatefulWidget {
  final FormFieldConfig field;
  final ValueChanged<FormFieldConfig> onSave;
  final VoidCallback onDelete;

  const FieldEditor({
    super.key,
    required this.field,
    required this.onSave,
    required this.onDelete,
  });

  @override
  State<FieldEditor> createState() => _FieldEditorState();
}

class _FieldEditorState extends State<FieldEditor> {
  late TextEditingController _labelCtrl;
  late TextEditingController _hintCtrl;
  late FieldType _type;
  late bool _required;

  @override
  void initState() {
    super.initState();
    _labelCtrl = TextEditingController(text: widget.field.label);
    _hintCtrl = TextEditingController(text: widget.field.hint ?? '');
    _type = widget.field.type;
    _required = widget.field.required;
  }

  @override
  void didUpdateWidget(FieldEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.field.id != widget.field.id) {
      _labelCtrl.text = widget.field.label;
      _hintCtrl.text = widget.field.hint ?? '';
      _type = widget.field.type;
      _required = widget.field.required;
    }
  }

  @override
  void dispose() {
    _labelCtrl.dispose();
    _hintCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Input(label: 'Label', controller: _labelCtrl),
                ),
                const SizedBox(width: 8),
                DropdownButton<FieldType>(
                  value: _type,
                  items: FieldType.values.map((t) {
                    return DropdownMenuItem(
                      value: t,
                      child: Text(t.name, style: const TextStyle(fontSize: 12)),
                    );
                  }).toList(),
                  onChanged: (v) => setState(() => _type = v!),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: Input(label: 'Hint', controller: _hintCtrl)),
                const SizedBox(width: 8),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Required', style: TextStyle(fontSize: 12)),
                    Switch(
                      value: _required,
                      onChanged: (v) => setState(() => _required = v),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Button(
                  variant: ButtonVariant.ghost,
                  onPressed: widget.onDelete,
                  child: const Text('Delete'),
                ),
                const SizedBox(width: 8),
                Button(
                  child: const Text('Save'),
                  onPressed: () {
                    widget.onSave(
                      widget.field.copyWith(
                        label: _labelCtrl.text,
                        type: _type,
                        required: _required,
                        hint: _hintCtrl.text.isNotEmpty ? _hintCtrl.text : null,
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
