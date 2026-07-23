import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class PaginationBar extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final VoidCallback? onPrevious;
  final VoidCallback? onNext;

  const PaginationBar({
    super.key,
    required this.currentPage,
    required this.totalPages,
    this.onPrevious,
    this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: colors.border)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: currentPage > 1 ? onPrevious : null,
          ),
          const SizedBox(width: 8),
          Text(
            'Page $currentPage of $totalPages',
            style: TextStyle(
              color: colors.fgMuted,
              fontSize: 13,
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: currentPage < totalPages ? onNext : null,
          ),
        ],
      ),
    );
  }
}
