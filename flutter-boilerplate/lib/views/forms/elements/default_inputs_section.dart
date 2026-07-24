import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';
import '../../../l10n/app_localizations.dart';

class DefaultInputsSection extends StatelessWidget {
  const DefaultInputsSection({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Input(label: t.formsElementsInputDefault_label),
        const SizedBox(height: 8),
        Input(
          label: t.formsElementsInputWithPlaceholder_label,
          hintText: t.formsElementsInputEnterSomething,
        ),
        const SizedBox(height: 8),
        Input(
          label: t.formsElementsInputWithError_label,
          errorText: t.formsElementsFieldRequired,
        ),
        const SizedBox(height: 8),
        Input(
          label: t.formsElementsInputDisabled_label,
          controller: TextEditingController(text: t.formsElementsReadOnly),
        ),
        const SizedBox(height: 8),
        Input(
          label: t.formsElementsInputWithIcon_label,
          prefixIcon: const Icon(Icons.search),
        ),
        const SizedBox(height: 8),
        Input(
          label: t.formsElementsValidationPassword_label,
          obscureText: true,
        ),
        const SizedBox(height: 8),
        Input(
          label: t.formsElementsInputNumeric_label,
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 8),
        Input(
          label: t.formsElementsInputWithHelper_label,
          helperText: t.formsElementsInputHelperMessage,
        ),
      ],
    );
  }
}
