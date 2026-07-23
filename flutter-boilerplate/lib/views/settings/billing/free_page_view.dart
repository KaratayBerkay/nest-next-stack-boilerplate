import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class FreeSettingsBillingPage extends StatelessWidget {
  final String lang;

  const FreeSettingsBillingPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Billing')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.credit_card_outlined, size: 48, color: colors.fgMuted),
              const SizedBox(height: 16),
              const Text('No billing info yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Upgrade to a paid plan to see billing details.',
                  style: TextStyle(color: colors.fgMuted),),
              const SizedBox(height: 24),
              Button(
                child: const Text('View Plans'),
                onPressed: () => context.go('/v1/$lang/plans'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
