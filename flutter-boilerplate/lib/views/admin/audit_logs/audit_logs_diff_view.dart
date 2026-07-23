import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class AuditLogsDiffView extends StatelessWidget {
  final Map<String, dynamic>? before;
  final Map<String, dynamic>? after;

  const AuditLogsDiffView({
    super.key,
    this.before,
    this.after,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Changes', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (before != null)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Before', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: colors.danger)),
                      const SizedBox(height: 4),
                      Text(
                        _prettyJson(before!),
                        style: TextStyle(fontSize: 10, color: colors.fg, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ),
              ),
            if (before != null && after != null) const SizedBox(width: 8),
            if (after != null)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('After', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: colors.success)),
                      const SizedBox(height: 4),
                      Text(
                        _prettyJson(after!),
                        style: TextStyle(fontSize: 10, color: colors.fg, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }

  String _prettyJson(Map<String, dynamic> json) {
    try {
      return json.entries.map((e) => '${e.key}: ${e.value}').join('\n');
    } catch (_) {
      return json.toString();
    }
  }
}
