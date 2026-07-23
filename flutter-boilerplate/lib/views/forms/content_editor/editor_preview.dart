import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class EditorPreview extends StatelessWidget {
  final String title;
  final String body;
  final String tags;

  const EditorPreview({
    super.key,
    required this.title,
    required this.body,
    required this.tags,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        if (tags.isNotEmpty) ...[
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            children: tags.split(',').map((t) => Chip(
              label: Text(t.trim(), style: const TextStyle(fontSize: 12)),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
            ),).toList(),
          ),
        ],
        const Divider(height: 24),
        Text(body, style: TextStyle(fontSize: 16, height: 1.6, color: colors.fg)),
      ],
    );
  }
}
