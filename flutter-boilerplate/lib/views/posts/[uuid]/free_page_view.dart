import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../constants/theme.dart';

class FreePostDetailPage extends ConsumerWidget {
  final String lang;
  final String postId;

  const FreePostDetailPage({super.key, required this.lang, required this.postId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Post')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock_outline, size: 48, color: colors.fgMuted),
              const SizedBox(height: 16),
              const Text(
                'Post Details Available on Paid Plans',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Upgrade to view post details and interact with content.',
                style: TextStyle(color: colors.fgMuted),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.go('/v1/$lang/plans'),
                child: const Text('Upgrade to View Post'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
