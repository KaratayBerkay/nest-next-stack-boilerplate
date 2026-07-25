import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../l10n/app_localizations.dart';
import '../../forms/elements/section_card.dart';
import 'dynamic_async.dart';
import 'eager_classic.dart';
import 'grid.dart';
import 'linked_fields.dart';
import 'programmatic_meta.dart';
import 'validation_modes.dart';

class FormsFieldStatesPageContent extends ConsumerWidget {
  final String lang;

  const FormsFieldStatesPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(
          title: t.formsFieldStatesHeading,
          children: const [FieldStatesGrid()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsFieldStatesValidationModes,
          children: const [ValidationModesExample()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsFieldStatesLinkedFields,
          children: const [LinkedFieldsExample()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsFieldStatesEager,
          children: const [EagerClassicExample()],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: t.formsFieldStatesDynamic,
          children: const [DynamicAsyncExample()],
        ),
        const SizedBox(height: 16),
        const SectionCard(
          title: 'Programmatic Meta',
          children: [ProgrammaticMetaExample()],
        ),
      ],
    );
  }
}
