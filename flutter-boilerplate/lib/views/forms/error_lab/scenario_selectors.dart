import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class ScenarioSelectors extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChanged;

  const ScenarioSelectors({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return DropdownButtonFormField<String>(
      initialValue: selected,
      items: [
        DropdownMenuItem(
          value: 'server-error',
          child: Text(t.formsErrorLabServerError),
        ),
        DropdownMenuItem(
          value: 'validation',
          child: Text(t.formsErrorLabValidationError),
        ),
        DropdownMenuItem(
          value: 'network',
          child: Text(t.formsErrorLabNetworkTimeout),
        ),
        DropdownMenuItem(
          value: 'rate-limit',
          child: Text(t.formsErrorLabRateLimited),
        ),
        DropdownMenuItem(
          value: 'auth-error',
          child: Text(t.formsErrorLabAuthError),
        ),
        const DropdownMenuItem(value: 'not-found', child: Text('Not Found')),
        const DropdownMenuItem(value: 'conflict', child: Text('Conflict')),
      ],
      onChanged: (v) => onChanged(v!),
      decoration: const InputDecoration(
        labelText: 'Scenario',
        border: OutlineInputBorder(),
      ),
    );
  }
}
