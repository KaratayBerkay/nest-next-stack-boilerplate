import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../constants/theme.dart';
import '../../../validators/forms/schema.dart' as forms;

class FormsApiKeyPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsApiKeyPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsApiKeyPageContent> createState() =>
      _FormsApiKeyPageContentState();
}

class _FormsApiKeyPageContentState
    extends ConsumerState<FormsApiKeyPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('API Key Manager')),
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
                    const Text(
                      'Create API Key',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    FormTextField(
                      controller: _nameCtrl,
                      label: 'Key Name',
                      validator: (v) => forms.validateRequired(v),
                    ),
                    const SizedBox(height: 12),
                    Button(
                      child: const Text('Generate Key'),
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {}
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: ListTile(
              title: const Text('Production Key'),
              subtitle: Text(
                'sk_prod_••••••••••••••••',
                style: TextStyle(color: colors.fgMuted, fontSize: 12),
              ),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline),
                onPressed: () {},
              ),
            ),
          ),
        ],
      ),
    );
  }
}
