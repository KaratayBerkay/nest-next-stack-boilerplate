import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomePageContent extends StatelessWidget {
  const HomePageContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flutter Boilerplate')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Welcome to Flutter Boilerplate'),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.go('/auth/login'),
              child: const Text('Login'),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => context.go('/auth/register'),
              child: const Text('Register'),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => context.go('/pricing'),
              child: const Text('View Pricing'),
            ),
          ],
        ),
      ),
    );
  }
}
