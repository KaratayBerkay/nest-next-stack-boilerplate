import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart' as auth;

class FormsProfilePageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsProfilePageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsProfilePageContent> createState() => _FormsProfilePageContentState();
}

class _FormsProfilePageContentState extends ConsumerState<FormsProfilePageContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController(text: 'John Doe');
  final _emailCtrl = TextEditingController(text: 'john@example.com');
  final _bioCtrl = TextEditingController(text: 'Full-stack developer');

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
      appBar: AppBar(title: const Text('User Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: Column(
              children: [
                Avatar(name: 'John Doe', radius: 40),
                const SizedBox(height: 8),
                TextButton(onPressed: () {}, child: const Text('Change Avatar')),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Profile Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    FormTextField(controller: _nameCtrl, label: 'Name', validator: auth.validateName),
                    const SizedBox(height: 8),
                    FormTextField(controller: _emailCtrl, label: 'Email', validator: auth.validateEmail),
                    const SizedBox(height: 8),
                    FormTextField(controller: _bioCtrl, label: 'Bio'),
                    const SizedBox(height: 16),
                    Button(
                      child: const Text('Save Profile'),
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {}
                      },
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
