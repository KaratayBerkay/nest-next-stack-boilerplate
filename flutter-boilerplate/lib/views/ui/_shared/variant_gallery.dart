import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class VariantGallery extends StatelessWidget {
  final String title;
  final List<VariantItem> items;
  final int crossAxisCount;

  const VariantGallery({
    super.key,
    required this.title,
    required this.items,
    this.crossAxisCount = 3,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 2.5,
          ),
          itemCount: items.length,
          itemBuilder: (_, i) {
            final item = items[i];
            return Container(
              decoration: BoxDecoration(
                color: colors.surfaceAlt,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: colors.border),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  item.widget,
                  const SizedBox(height: 4),
                  Text(
                    item.label,
                    style: TextStyle(fontSize: 10, color: colors.fgMuted),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class VariantItem {
  final Widget widget;
  final String label;

  const VariantItem({required this.widget, required this.label});
}
