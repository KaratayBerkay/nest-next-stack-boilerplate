import 'package:flutter/material.dart';

import '../../../components/ui/textarea/textarea.dart';
import '../../../l10n/app_localizations.dart';

class TextareaSection extends StatelessWidget {
  const TextareaSection({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Textarea(label: t.formsElementsTextareaDefaultLabel),
        const SizedBox(height: 8),
        Textarea(
          label: t.formsElementsInputWithPlaceholder_label,
          hintText: t.formsElementsTextareaTypeMessage,
        ),
        const SizedBox(height: 8),
        Textarea(
          label: t.formsElementsInputWithError_label,
          errorText: t.formsElementsMessageRequired,
        ),
        const SizedBox(height: 8),
        Textarea(
          label: t.formsElementsTextareaTall_label,
          controller: TextEditingController(text: t.formsElementsSomeContent),
          minLines: 5,
        ),
        const SizedBox(height: 8),
        Textarea(
          label: t.formsElementsTextareaNoLabel,
          hintText: t.formsElementsEnterText,
        ),
      ],
    );
  }
}
