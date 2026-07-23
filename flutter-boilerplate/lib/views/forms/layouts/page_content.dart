import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/input/input.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart' as auth;

class FormsLayoutsPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsLayoutsPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsLayoutsPageContent> createState() => _FormsLayoutsPageContentState();
}

class _FormsLayoutsPageContentState extends ConsumerState<FormsLayoutsPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Form Layouts')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Two Column Grid', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  const Row(
                    children: [
                      Expanded(child: Input(label: 'First Name')),
                      SizedBox(width: 12),
                      Expanded(child: Input(label: 'Last Name')),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Input(label: 'Email'),
                  const SizedBox(height: 16),
                  const Text('FormTextField Examples', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(child: FormTextField(controller: _firstNameCtrl, label: 'First Name', validator: auth.validateName)),
                            const SizedBox(width: 12),
                            Expanded(child: FormTextField(controller: _lastNameCtrl, label: 'Last Name', validator: auth.validateName)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        FormTextField(controller: _emailCtrl, label: 'Email', validator: auth.validateEmail),
                        const SizedBox(height: 12),
                        Button(
                          child: const Text('Submit'),
                          onPressed: () {
                            if (_formKey.currentState!.validate()) {}
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Sectioned Form', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Personal Info', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 8),
                  const Input(label: 'Full Name'),
                  const SizedBox(height: 8),
                  const Input(label: 'Phone'),
                  const SizedBox(height: 12),
                  const Text('Address', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 8),
                  const Input(label: 'Street'),
                  const SizedBox(height: 8),
                  const Row(
                    children: [
                      Expanded(child: Input(label: 'City')),
                      SizedBox(width: 12),
                      Expanded(child: Input(label: 'ZIP')),
                    ],
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
