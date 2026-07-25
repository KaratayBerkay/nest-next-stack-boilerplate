import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../l10n/app_localizations.dart';
import 'date_time_section.dart';
import 'default_inputs_section.dart';
import 'file_upload_sections.dart';
import 'form_validation_section.dart';
import 'section_card.dart';
import 'selects_section.dart';
import 'textarea_section.dart';
import 'toggles_section.dart';

class FormsElementsPageContent extends ConsumerWidget {
  final String lang;

  const FormsElementsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(
          title: t.formsElementsSection_defaultInputs,
          children: const [DefaultInputsSection()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsElementsSection_selectInputs,
          children: const [SelectsSection()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsElementsSection_textarea,
          children: const [TextareaSection()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsElementsSection_toggleSwitches,
          children: const [TogglesSection()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsElementsSection_dateTimePickers,
          children: const [DateTimeSection()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsElementsSection_fileInput,
          children: const [FileUploadSections()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsElementsSection_formValidation,
          children: const [FormValidationSection()],
        ),
      ],
    );
  }
}
