import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/button/button.dart';

class InvoicePagination extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final VoidCallback? onPrevious;
  final VoidCallback? onNext;
  final bool isLoading;

  const InvoicePagination({
    super.key,
    required this.currentPage,
    required this.totalPages,
    this.onPrevious,
    this.onNext,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Button(
          variant: ButtonVariant.outline,
          size: ButtonSize.sm,
          child: const Text('Previous'),
          onPressed: currentPage > 1 ? onPrevious : null,
        ),
        const SizedBox(width: 16),
        Text(
          'Page $currentPage of $totalPages',
          style: TextStyle(fontSize: 13, color: colors.fgMuted),
        ),
        const SizedBox(width: 16),
        Button(
          variant: ButtonVariant.outline,
          size: ButtonSize.sm,
          child: const Text('Next'),
          onPressed: currentPage < totalPages ? onNext : null,
        ),
      ],
    );
  }
}
