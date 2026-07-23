import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart' as auth;
import '../../../validators/forms/schema.dart' as forms;

class FormsAdvancedPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsAdvancedPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsAdvancedPageContent> createState() => _FormsAdvancedPageContentState();
}

class _FormsAdvancedPageContentState extends ConsumerState<FormsAdvancedPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(title: const Text('Advanced Patterns')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Personal Info', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    FormTextField(controller: _nameCtrl, label: 'Name', validator: auth.validateName),
                    const SizedBox(height: 8),
                    FormTextField(controller: _emailCtrl, label: 'Email', validator: auth.validateEmail),
                    const SizedBox(height: 8),
                    FormTextField(controller: _bioCtrl, label: 'Bio', maxLines: 3, validator: (v) => forms.validateRequired(v, 'Bio')),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {}
                      },
                      child: const Text('Save'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
