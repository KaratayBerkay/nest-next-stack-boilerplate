import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class MessagesSidebarSearch extends StatelessWidget {
  final ValueChanged<String> onChanged;

  const MessagesSidebarSearch({
    super.key,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.all(12),
      child: TextField(
        onChanged: onChanged,
        decoration: InputDecoration(
          hintText: 'Search conversations...',
          prefixIcon: const Icon(Icons.search, size: 18),
          filled: true,
          fillColor: colors.surfaceAlt,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none,
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
      ),
    );
  }
}
