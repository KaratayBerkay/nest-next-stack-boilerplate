import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class EditorHeader extends StatelessWidget {
  final String title;
  final bool isPreview;
  final VoidCallback? onTogglePreview;
  final VoidCallback? onBack;

  const EditorHeader({
    super.key,
    this.title = 'Content Editor',
    this.isPreview = false,
    this.onTogglePreview,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Row(
      children: [
        if (onBack != null)
          IconButton(
            icon: Icon(Icons.arrow_back, color: colors.fg),
            onPressed: onBack,
          ),
        Expanded(child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600))),
        Button(
          variant: ButtonVariant.ghost,
          size: ButtonSize.sm,
          onPressed: onTogglePreview,
          child: Text(isPreview ? 'Edit' : 'Preview'),
        ),
      ],
    );
  }
}
