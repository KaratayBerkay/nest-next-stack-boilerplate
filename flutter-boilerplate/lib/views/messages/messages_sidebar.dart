import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import 'messages_sidebar_search.dart';
import 'messages_sidebar_tab_bar.dart';
import 'messages_sidebar_conversations.dart';
import 'messages_sidebar_friends.dart';

class MessagesSidebar extends ConsumerStatefulWidget {
  final String lang;

  const MessagesSidebar({super.key, required this.lang});

  @override
  ConsumerState<MessagesSidebar> createState() => _MessagesSidebarState();
}

class _MessagesSidebarState extends ConsumerState<MessagesSidebar> {
  int _activeTab = 0;
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      width: 320,
      decoration: BoxDecoration(
        border: Border(right: BorderSide(color: colors.border)),
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
                ? MessagesSidebarConversations(
                    lang: widget.lang,
                    searchQuery: _searchQuery,
                  )
                : const MessagesSidebarFriends(),
          ),
        ],
      ),
    );
  }
}
