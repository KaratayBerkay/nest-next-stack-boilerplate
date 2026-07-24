import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/checkbox/checkbox.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../components/ui/input/input.dart';
import '../../../components/ui/switch/switch.dart';
import '../../../components/ui/textarea/textarea.dart';
import '../../../l10n/app_localizations.dart';

class FormsElementsPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsElementsPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsElementsPageContent> createState() =>
      _FormsElementsPageContentState();
}

class _FormsElementsPageContentState
    extends ConsumerState<FormsElementsPageContent> {
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
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.formsElementsHeading)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Input Fields',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  const Input(label: 'Default Input'),
                  const SizedBox(height: 8),
                  const Input(
                    label: 'With Error',
                    errorText: 'This field is required',
                  ),
                  const SizedBox(height: 8),
                  Input(
                    label: 'Disabled',
                    controller: TextEditingController(text: 'read only'),
                  ),
                  const SizedBox(height: 8),
                  const Input(
                    label: 'With Icon',
                    prefixIcon: Icon(Icons.search),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'FormTextField Examples',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        FormTextField(controller: _nameCtrl, label: 'Name'),
                        const SizedBox(height: 8),
                        FormTextField(controller: _emailCtrl, label: 'Email'),
                        const SizedBox(height: 12),
                        FilledButton(
                          onPressed: () {
                            if (_formKey.currentState!.validate()) {}
                          },
                          child: Text(t.formsFormBuilderSubmitPreview),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Textarea',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  const Textarea(label: 'Message'),
                  const SizedBox(height: 16),
                  const Text(
                    'Checkboxes & Switches',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  const CheckboxWidget(value: false, label: 'Accept terms'),
                  const SizedBox(height: 8),
                  const SwitchWidget(value: true),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
