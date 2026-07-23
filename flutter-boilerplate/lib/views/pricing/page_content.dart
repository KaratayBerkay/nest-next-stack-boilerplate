import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PricingPageContent extends StatelessWidget {
  const PricingPageContent({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = 'en';
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) {
        context.go('/v1/$lang/plans');
      }
    });
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
