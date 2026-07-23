import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/posts/actions.dart';
import '../../../constants/theme.dart';
import '../../../types/feed/post.dart';

class PostEditForm extends ConsumerStatefulWidget {
  final Post post;
  final VoidCallback onSaved;

  const PostEditForm({super.key, required this.post, required this.onSaved});

  @override
  ConsumerState<PostEditForm> createState() => _PostEditFormState();
}

class _PostEditFormState extends ConsumerState<PostEditForm> {
  late final TextEditingController _titleController;
  late final TextEditingController _contentController;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.post.title);
    _contentController = TextEditingController(text: widget.post.content);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _titleController,
          decoration: const InputDecoration(
            labelText: 'Title',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _contentController,
          decoration: const InputDecoration(
            labelText: 'Content',
            border: OutlineInputBorder(),
          ),
          maxLines: 8,
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            OutlinedButton(
              onPressed: widget.onSaved,
              child: const Text('Cancel'),
            ),
            const SizedBox(width: 8),
            FilledButton(
              onPressed: () async {
                final title = _titleController.text.trim();
                final content = _contentController.text.trim();
                if (title.isEmpty || content.isEmpty) return;
                await ref.read(postActionsProvider).update(
                  widget.post.id,
                  title: title,
                  content: content,
                );
                widget.onSaved();
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ],
    );
  }
}
