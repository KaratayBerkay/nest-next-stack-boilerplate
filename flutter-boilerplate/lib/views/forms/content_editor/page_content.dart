import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../l10n/app_localizations.dart';
import '../../../validators/forms/schema.dart' as forms;

class FormsContentEditorPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsContentEditorPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsContentEditorPageContent> createState() =>
      _FormsContentEditorPageContentState();
}

class _FormsContentEditorPageContentState
    extends ConsumerState<FormsContentEditorPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _bodyCtrl = TextEditingController();
  final _tagsCtrl = TextEditingController();

  @override
  void dispose() {
    _titleCtrl.dispose();
    _bodyCtrl.dispose();
    _tagsCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(t.formsContentEditorHeading),
        actions: [
          TextButton(
            onPressed: () {},
            child: Text(t.formsContentEditorPreview),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Form(
            key: _formKey,
            child: Column(
              children: [
                FormTextField(
                  controller: _titleCtrl,
                  label: 'Title',
                  validator: (v) => forms.validateRequired(v, 'Title'),
                ),
                const SizedBox(height: 12),
                FormTextField(
                  controller: _tagsCtrl,
                  label: 'Tags (comma separated)',
                ),
                const SizedBox(height: 12),
                FormTextField(
                  controller: _bodyCtrl,
                  label: 'Content',
                  maxLines: 12,
                  validator: (v) => forms.validateMinLength(v, 10, 'Content'),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Button(
                        variant: ButtonVariant.outline,
                        child: Text(t.formsContentEditorSaveDraft),
                        onPressed: () {},
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Button(
                        child: Text(t.formsContentEditorPublish),
                        onPressed: () {
                          if (_formKey.currentState!.validate()) {}
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
