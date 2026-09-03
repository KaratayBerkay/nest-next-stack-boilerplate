import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/routes.dart';
import '../../l10n/app_localizations.dart';

class HomePageContent extends StatelessWidget {
  const HomePageContent({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.homeTitle)),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(t.homeWelcome),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.go('/auth/login'),
              child: Text(t.homeSignIn),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => context.go('/auth/register'),
              child: Text(t.homeRegister),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => context.go('/pricing'),
              child: Text(t.homeViewPricing),
            ),
            // The About page had no in-app way in on either platform
            // (CROSS-038) — this is the Flutter twin of the web marketing
            // header's Pricing / About links.
            TextButton(
              onPressed: () => context.go(Routes.about),
              child: Text(t.homeViewAbout),
            ),
          ],
        ),
      ),
    );
  }
}
