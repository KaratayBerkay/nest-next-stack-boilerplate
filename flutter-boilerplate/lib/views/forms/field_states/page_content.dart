import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../components/ui/input/input.dart';
import '../../../validators/forms/schema.dart' as forms;

class FormsFieldStatesPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsFieldStatesPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsFieldStatesPageContent> createState() => _FormsFieldStatesPageContentState();
}

class _FormsFieldStatesPageContentState extends ConsumerState<FormsFieldStatesPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Field States & Validation')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Field States', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  const Input(label: 'Default'),
                  const SizedBox(height: 8),
                  const Input(label: 'With Error', errorText: 'Invalid input'),
                  const SizedBox(height: 8),
                  Input(label: 'Filled', controller: TextEditingController(text: 'Some value')),
                  const SizedBox(height: 8),
                  const Input(label: 'With Helper', helperText: 'This is a helper message'),
                  const SizedBox(height: 8),
                  const Input(label: 'Password', obscureText: true),
                  const SizedBox(height: 16),
                  const Text('FormTextField Examples', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        FormTextField(controller: _nameCtrl, label: 'Name', validator: (v) => forms.validateRequired(v)),
                        const SizedBox(height: 8),
                        FormTextField(controller: _emailCtrl, label: 'Email'),
                        const SizedBox(height: 12),
                        FilledButton(
                          onPressed: () {
                            if (_formKey.currentState!.validate()) {}
                          },
                          child: const Text('Submit'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
