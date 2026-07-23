import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';

class TriggerHandler extends StatelessWidget {
  final VoidCallback? onTrigger;
  final bool loading;
  final String label;

  const TriggerHandler({
    super.key,
    this.onTrigger,
    this.loading = false,
    this.label = 'Trigger Error',
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Button(
          onPressed: onTrigger,
          loading: loading,
          child: Text(label),
        ),
        const SizedBox(width: 12),
        Text(loading ? 'Processing...' : 'Ready to trigger', style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
