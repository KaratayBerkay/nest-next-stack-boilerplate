import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class FormValidationSection extends StatefulWidget {
  const FormValidationSection({super.key});

  @override
  State<FormValidationSection> createState() => _FormValidationSectionState();
}

class _FormValidationSectionState extends State<FormValidationSection> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Input(label: 'Default State'),
          const SizedBox(height: 8),
          const Input(label: 'Error State', errorText: 'Invalid value'),
          const SizedBox(height: 8),
          const Input(label: 'Success State', helperText: 'Looks good!'),
          const SizedBox(height: 8),
          const Input(label: 'Disabled State'),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () => _formKey.currentState?.validate(),
            child: const Text('Validate'),
          ),
        ],
      ),
    );
  }
}
