import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../constants/theme.dart';
import '../../../validators/forms/schema.dart' as forms;

class ApiKeyCreateForm extends StatefulWidget {
  final TextEditingController nameCtrl;
  final GlobalKey<FormState> formKey;
  final VoidCallback? onGenerate;

  const ApiKeyCreateForm({
    super.key,
    required this.nameCtrl,
    required this.formKey,
    this.onGenerate,
  });

  @override
  State<ApiKeyCreateForm> createState() => _ApiKeyCreateFormState();
}

class _ApiKeyCreateFormState extends State<ApiKeyCreateForm> {
  int _selectedScope = 0;

  final _scopes = ['Full Access', 'Read Only', 'Custom'];

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: widget.formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Create API Key', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              FormTextField(controller: widget.nameCtrl, label: 'Key Name', validator: (v) => forms.validateRequired(v)),
              const SizedBox(height: 12),
              Text('Scope', style: TextStyle(color: colors.fgMuted, fontSize: 13)),
              const SizedBox(height: 4),
              SegmentedButton<int>(
                segments: _scopes.asMap().entries.map((e) => ButtonSegment(value: e.key, label: Text(e.value))).toList(),
                selected: {_selectedScope},
                onSelectionChanged: (v) => setState(() => _selectedScope = v.first),
              ),
              const SizedBox(height: 16),
              Button(
                onPressed: widget.onGenerate,
                child: const Text('Generate Key'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
