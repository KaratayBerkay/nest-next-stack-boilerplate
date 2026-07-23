import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../validators/forms/schema.dart' as forms;

class FormsFormBuilderPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsFormBuilderPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsFormBuilderPageContent> createState() => _FormsFormBuilderPageContentState();
}

class _FormsFormBuilderPageContentState extends ConsumerState<FormsFormBuilderPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _fields = <_FormField>[];

  @override
  void dispose() {
    for (final f in _fields) {
      f.controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Form Builder')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Preview', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        ..._fields.map((f) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: FormTextField(controller: f.controller, label: f.label, validator: (v) => forms.validateRequired(v)),
                        )),
                      ],
                    ),
                  ),
                  if (_fields.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(child: Text('Add fields below')),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Add Field', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  Button(child: const Text('+ Text Field'), onPressed: () {
                    setState(() => _fields.add(_FormField(label: 'New Field ${_fields.length + 1}')));
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FormField {
  final String label;
  final TextEditingController controller;

  _FormField({required this.label}) : controller = TextEditingController();
}
