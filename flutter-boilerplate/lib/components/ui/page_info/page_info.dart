import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../button/button.dart';

class PageInfoSection {
  final String title;
  final String description;

  const PageInfoSection({
    required this.title,
    required this.description,
  });
}

class PageInfoContent {
  final String title;
  final String description;
  final List<PageInfoSection> sections;
  final List<String>? tips;

  const PageInfoContent({
    required this.title,
    required this.description,
    required this.sections,
    this.tips,
  });
}

class PageInfoButton extends StatelessWidget {
  final PageInfoContent content;

  const PageInfoButton({
    super.key,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Button(
      variant: ButtonVariant.ghost,
      size: ButtonSize.sm,
      child: Icon(Icons.info_outline, size: 16, color: colors.fgMuted),
      onPressed: () => _showDialog(context),
    );
  }

  void _showDialog(BuildContext context) {
    final colors = AppColors.of(context);

    showDialog<void>(
      context: context,
      builder: (ctx) => Dialog(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    content.title,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    content.description,
                    style: TextStyle(fontSize: 13, color: colors.fgMuted),
                  ),
                  const SizedBox(height: 16),
                  ..._buildSections(colors),
                  if (content.tips != null && content.tips!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _buildTipsBox(colors),
                  ],
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Button(
                      variant: ButtonVariant.outline,
                      size: ButtonSize.sm,
                      child: const Text('Close'),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildSections(AppColors colors) {
    final widgets = <Widget>[];
    for (final section in content.sections) {
      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              section.title,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 2),
            Text(
              section.description,
              style: TextStyle(fontSize: 12, color: colors.fgMuted, height: 1.4),
            ),
          ],
        ),
      ),
    );
    }
    return widgets;
  }

  Widget _buildTipsBox(AppColors colors) {
    final tips = content.tips!;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceAlt,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tips',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: colors.fg),
          ),
          const SizedBox(height: 4),
          for (final tip in tips)
            Padding(
              padding: const EdgeInsets.only(bottom: 2),
              child: Text(tip, style: TextStyle(fontSize: 12, color: colors.fgMuted)),
            ),
        ],
      ),
    );
  }
}
