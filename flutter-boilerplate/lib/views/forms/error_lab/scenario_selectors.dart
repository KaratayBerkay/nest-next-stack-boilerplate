import 'package:flutter/material.dart';

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
    return DropdownButtonFormField<String>(
      initialValue: selected,
      items: const [
        DropdownMenuItem(value: 'server-error', child: Text('Server Error')),
        DropdownMenuItem(value: 'validation', child: Text('Validation Error')),
        DropdownMenuItem(value: 'network', child: Text('Network Timeout')),
        DropdownMenuItem(value: 'rate-limit', child: Text('Rate Limited')),
        DropdownMenuItem(value: 'auth-error', child: Text('Auth Error')),
        DropdownMenuItem(value: 'not-found', child: Text('Not Found')),
        DropdownMenuItem(value: 'conflict', child: Text('Conflict')),
      ],
      onChanged: (v) => onChanged(v!),
      decoration: const InputDecoration(
        labelText: 'Scenario',
        border: OutlineInputBorder(),
      ),
    );
  }
}
