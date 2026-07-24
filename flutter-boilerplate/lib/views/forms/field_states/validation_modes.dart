import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';
import '../../../l10n/app_localizations.dart';

class ValidationModesExample extends StatefulWidget {
  const ValidationModesExample({super.key});

  @override
  State<ValidationModesExample> createState() => _ValidationModesExampleState();
}

class _ValidationModesExampleState extends State<ValidationModesExample> {
  String _mode = 'on-change';

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Column(
      children: [
        Row(
          children: [
            const Text('Mode:', style: TextStyle(fontWeight: FontWeight.w500)),
            const SizedBox(width: 8),
            DropdownButton<String>(
              value: _mode,
              items: [
                DropdownMenuItem(
                  value: 'on-change',
                  child: Text(t.formsFieldStatesOnChange),
                ),
                DropdownMenuItem(
                  value: 'on-blur',
                  child: Text(t.formsFieldStatesOnBlur),
                ),
                DropdownMenuItem(
                  value: 'on-submit',
                  child: Text(t.formsFieldStatesOnSubmit),
                ),
                DropdownMenuItem(
                  value: 'lazy',
                  child: Text(t.formsFieldStatesLazy),
                ),
              ],
              onChanged: (v) => setState(() => _mode = v!),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Input(label: 'Field 1', helperText: 'Mode: $_mode'),
        const SizedBox(height: 8),
        const Input(label: 'Field 2'),
        const SizedBox(height: 8),
        const Input(label: 'Field 3'),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: _mode == 'on-submit' ? () {} : null,
          child: Text(t.formsCommonSubmit),
        ),
      ],
    );
  }
}
