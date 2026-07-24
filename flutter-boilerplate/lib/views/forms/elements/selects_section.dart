import 'package:flutter/material.dart';

import '../../../components/ui/select/select.dart';
import '../../../l10n/app_localizations.dart';

class SelectsSection extends StatefulWidget {
  const SelectsSection({super.key});

  @override
  State<SelectsSection> createState() => _SelectsSectionState();
}

class _SelectsSectionState extends State<SelectsSection> {
  String? _simple;
  String? _withLabel;
  String? _withError;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SelectWidget(
          label: t.formsElementsSelectSimple_label,
          hintText: t.formsElementsSelectChoose,
          items: [
            t.formsElementsOptionA,
            t.formsElementsOptionB,
            t.formsElementsOptionC,
          ],
          value: _simple,
          onChanged: (v) => setState(() => _simple = v),
        ),
        const SizedBox(height: 8),
        SelectWidget(
          label: t.formsElementsSelectWithLabel_label,
          items: [
            t.formsElementsItem1,
            t.formsElementsItem2,
            t.formsElementsItem3,
            t.formsElementsItem4,
          ],
          value: _withLabel,
          onChanged: (v) => setState(() => _withLabel = v),
        ),
        const SizedBox(height: 8),
        SelectWidget(
          label: t.formsElementsInputWithError_label,
          hintText: t.formsElementsSelectValue,
          items: [
            t.formsElementsRed,
            t.formsElementsGreen,
            t.formsElementsBlue,
          ],
          value: _withError,
          errorText: t.formsElementsSelectColorError,
          onChanged: (v) => setState(() => _withError = v),
        ),
      ],
    );
  }
}
