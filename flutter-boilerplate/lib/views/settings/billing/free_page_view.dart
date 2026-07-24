import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class FreeSettingsBillingPage extends StatelessWidget {
  final String lang;

  const FreeSettingsBillingPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.settingsBillingHeading)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.credit_card_outlined, size: 48, color: colors.fgMuted),
              const SizedBox(height: 16),
              Text(
                t.settingsNoBillingInfo,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                t.settingsBillingUpgradePrompt,
                style: TextStyle(color: colors.fgMuted),
              ),
              const SizedBox(height: 24),
              Button(
                child: Text(t.settingsViewPlans),
                onPressed: () => context.go('/v1/$lang/plans'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
