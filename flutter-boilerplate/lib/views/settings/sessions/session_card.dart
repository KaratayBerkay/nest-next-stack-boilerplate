import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class SessionCard extends StatelessWidget {
  final String id;
  final String device;
  final String? location;
  final String? lastActive;
  final bool isCurrent;
  final VoidCallback? onRevoke;

  const SessionCard({
    super.key,
    required this.id,
    required this.device,
    this.location,
    this.lastActive,
    this.isCurrent = false,
    this.onRevoke,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Card(
      child: ListTile(
        leading: Icon(
          isCurrent ? Icons.devices : Icons.device_unknown,
          color: isCurrent ? colors.brand : colors.fgMuted,
        ),
        title: Text(device),
        subtitle: Text(
          [if (location != null) location, if (lastActive != null) lastActive]
              .where((s) => s != null && s.isNotEmpty)
              .join(' · '),
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        trailing: isCurrent
            ? Badge(
                label: Text(
                  t.settingsCurrentSession,
                  style: const TextStyle(fontSize: 11),
                ),
                backgroundColor: colors.success,
              )
            : TextButton(
                onPressed: onRevoke,
                child: Text(
                  t.settingsRevoke,
                  style: const TextStyle(fontSize: 12),
                ),
              ),
      ),
    );
  }
}
