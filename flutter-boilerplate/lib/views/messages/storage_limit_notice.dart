import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

/// Mirrors web's `views/messages/StorageLimitNotice.tsx` — replaces the
/// composer entirely once the real, server-enforced message-storage cap is
/// hit, instead of only being discoverable via a raw failed send.
class StorageLimitNotice extends StatelessWidget {
  const StorageLimitNotice({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: colors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(Icons.error_outline, size: 16, color: colors.danger),
              const SizedBox(width: 8),
              Text(
                t.storageLimitReached,
                style: TextStyle(
                  color: colors.danger,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Padding(
            padding: const EdgeInsets.only(left: 24),
            child: Text(
              t.storageLimitUpgradeHint,
              style: TextStyle(color: colors.fgMuted, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
