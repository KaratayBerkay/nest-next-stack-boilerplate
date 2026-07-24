import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class PostPage extends StatelessWidget {
  final String postId;
  final String? category;

  const PostPage({super.key, required this.postId, this.category});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final subtitle =
        category != null ? 'Category: $category' : 'No category specified';

    return Scaffold(
      appBar: AppBar(title: Text(t.routingPost(postId))),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.description,
                size: 64,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 16),
              Text(
                'Post Page',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              Text(
                'This page demonstrates nested routing with optional query parameters.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
