import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class PaginationWidget extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final void Function(int) onPageChanged;
  final bool showFirstLast;

  const PaginationWidget({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.onPageChanged,
    this.showFirstLast = true,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (showFirstLast)
          _buildButton(context, Icons.first_page, 0, currentPage == 0, colors),
        _buildButton(context, Icons.chevron_left, currentPage - 1,
            currentPage == 0, colors,),
        ...List.generate(totalPages, (i) {
          final isActive = i == currentPage;
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 2),
            child: Material(
              color: isActive ? colors.brand : Colors.transparent,
              borderRadius: BorderRadius.circular(4),
              child: InkWell(
                borderRadius: BorderRadius.circular(4),
                onTap: isActive ? null : () => onPageChanged(i),
                child: Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  child: Text(
                    '${i + 1}',
                    style: TextStyle(
                      color: isActive ? colors.surface : colors.fg,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
        _buildButton(context, Icons.chevron_right, currentPage + 1,
            currentPage >= totalPages - 1, colors,),
        if (showFirstLast)
          _buildButton(context, Icons.last_page, totalPages - 1,
              currentPage >= totalPages - 1, colors,),
      ],
    );
  }

  Widget _buildButton(
      BuildContext context, IconData icon, int page, bool disabled, AppColors colors,) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      child: IconButton(
        icon: Icon(icon, size: 18),
        onPressed: disabled ? null : () => onPageChanged(page),
        color: disabled ? colors.fgMuted : colors.fg,
        style: IconButton.styleFrom(
          minimumSize: const Size(32, 32),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        ),
      ),
    );
  }
}
