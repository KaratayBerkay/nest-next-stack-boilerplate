import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class ErrorResultDisplay extends StatelessWidget {
  final String? errorCode;
  final String? errorMessage;
  final String? scenario;

  const ErrorResultDisplay({
    super.key,
    this.errorCode,
    this.errorMessage,
    this.scenario,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    if (errorCode == null && errorMessage == null) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.green.shade50,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: Colors.green.shade200),
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 18),
            const SizedBox(width: 8),
            Text(
              t.formsErrorLabNoErrors,
              style: const TextStyle(color: Colors.green),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 18),
              const SizedBox(width: 8),
              Text(
                scenario ?? t.formsErrorLabError,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Colors.red,
                ),
              ),
            ],
          ),
          if (errorCode != null) ...[
            const SizedBox(height: 4),
            Text(
              t.formsErrorLabCode(errorCode!),
              style: TextStyle(fontSize: 12, color: Colors.red.shade700),
            ),
          ],
          if (errorMessage != null) ...[
            const SizedBox(height: 4),
            Text(
              errorMessage!,
              style: TextStyle(fontSize: 12, color: Colors.red.shade700),
            ),
          ],
        ],
      ),
    );
  }
}
