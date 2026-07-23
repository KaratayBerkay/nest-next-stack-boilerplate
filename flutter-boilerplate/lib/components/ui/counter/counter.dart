import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class CounterWidget extends StatelessWidget {
  final int value;
  final void Function(int)? onChanged;
  final int min;
  final int max;
  final int step;

  const CounterWidget({
    super.key,
    required this.value,
    this.onChanged,
    this.min = 0,
    this.max = 999,
    this.step = 1,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove, size: 16),
            onPressed: value > min ? () => onChanged?.call(value - step) : null,
            style: IconButton.styleFrom(
              minimumSize: const Size(36, 36),
              shape: const RoundedRectangleBorder(),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              '$value',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add, size: 16),
            onPressed: value < max ? () => onChanged?.call(value + step) : null,
            style: IconButton.styleFrom(
              minimumSize: const Size(36, 36),
              shape: const RoundedRectangleBorder(),
            ),
          ),
        ],
      ),
    );
  }
}
