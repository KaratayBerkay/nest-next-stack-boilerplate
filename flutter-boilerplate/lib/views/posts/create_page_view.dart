import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/actions.dart';
import '../../l10n/app_localizations.dart';

class PostCreatePageContent extends ConsumerWidget {
  final String lang;

  const PostCreatePageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(t.postsCreate),
        actions: [
          TextButton(
            onPressed: () async {
              final title = titleController.text.trim();
              final content = contentController.text.trim();
              if (title.isEmpty || content.isEmpty) return;
              await ref
                  .read(postActionsProvider)
                  .create(title: title, content: content);
              if (context.mounted) context.pop();
            },
            child: Text(t.postsCreateSubmit),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: titleController,
            decoration: InputDecoration(
              labelText: t.postsTitleLabel,
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: contentController,
            decoration: InputDecoration(
              labelText: t.postsContentLabel,
              border: const OutlineInputBorder(),
            ),
            maxLines: 8,
          ),
        ],
      ),
    );
  }
}
