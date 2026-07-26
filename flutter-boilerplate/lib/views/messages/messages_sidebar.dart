import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/container.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import 'messages_sidebar_conversations.dart';
import 'messages_sidebar_friends.dart';
import 'messages_sidebar_search.dart';
import 'messages_sidebar_tab_bar.dart';

class MessagesSidebar extends ConsumerStatefulWidget {
  const MessagesSidebar({super.key});

  @override
  ConsumerState<MessagesSidebar> createState() => _MessagesSidebarState();
}

class _MessagesSidebarState extends ConsumerState<MessagesSidebar> {
  int _activeTab = 0;
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final isMobile = context.isMobile;

    return Container(
      width: isMobile ? double.infinity : 320,
      decoration: BoxDecoration(
        border:
            isMobile ? null : Border(right: BorderSide(color: colors.border)),
      ),
      child: Column(
        children: [
          MessagesSidebarSearch(
            onChanged: (v) => setState(() => _searchQuery = v),
          ),
          MessagesSidebarTabBar(
            activeTab: _activeTab,
            onTabChanged: (v) => setState(() => _activeTab = v),
          ),
          Expanded(
            child: _activeTab == 0
                ? MessagesSidebarConversations(searchQuery: _searchQuery)
                : const MessagesSidebarFriends(),
          ),
        ],
      ),
    );
  }
}
