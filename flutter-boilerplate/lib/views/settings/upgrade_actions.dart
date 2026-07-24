import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../components/ui/button/button.dart';
import '../../l10n/app_localizations.dart';

class UpgradeActions extends StatelessWidget {
  final String lang;
  final bool isOnPaidPlan;
  final VoidCallback? onCancel;

  const UpgradeActions({
    super.key,
    required this.lang,
    this.isOnPaidPlan = false,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!isOnPaidPlan)
          Button(
            fullWidth: true,
            child: Text(t.settingsUpgradePlan),
            onPressed: () => context.go('/v1/$lang/plans'),
          ),
        if (isOnPaidPlan) ...[
          Button(
            fullWidth: true,
            variant: ButtonVariant.outline,
            child: Text(t.settingsChangePlan),
            onPressed: () => context.go('/v1/$lang/plans'),
          ),
          const SizedBox(height: 8),
          Button(
            fullWidth: true,
            variant: ButtonVariant.danger,
            onPressed: onCancel,
            child: Text(t.settingsCancelSubscription),
          ),
        ],
      ],
    );
  }
}
