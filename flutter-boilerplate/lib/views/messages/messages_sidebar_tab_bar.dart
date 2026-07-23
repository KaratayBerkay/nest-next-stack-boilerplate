import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class MessagesSidebarTabBar extends StatelessWidget {
  final int activeTab;
  final ValueChanged<int> onTabChanged;

  const MessagesSidebarTabBar({
    super.key,
    required this.activeTab,
    required this.onTabChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => onTabChanged(0),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: activeTab == 0 ? colors.brand : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  'Conversations',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: activeTab == 0 ? FontWeight.w600 : FontWeight.normal,
                    color: activeTab == 0 ? colors.fg : colors.fgMuted,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => onTabChanged(1),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: activeTab == 1 ? colors.brand : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  'Friends',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: activeTab == 1 ? FontWeight.w600 : FontWeight.normal,
                    color: activeTab == 1 ? colors.fg : colors.fgMuted,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
