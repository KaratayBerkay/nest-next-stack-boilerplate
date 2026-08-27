import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/container.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import 'messages_sidebar_conversations.dart';
import 'messages_sidebar_filter_bar.dart';
import 'messages_sidebar_friends.dart';
import 'messages_sidebar_search.dart';
import 'messages_sidebar_tab_bar.dart';

class MessagesSidebar extends ConsumerStatefulWidget {
  final String lang;

  const MessagesSidebar({super.key, required this.lang});

  @override
  ConsumerState<MessagesSidebar> createState() => _MessagesSidebarState();
}

class _MessagesSidebarState extends ConsumerState<MessagesSidebar> {
  int _activeTab = 0;
  String _searchQuery = '';
  MessagesFilter _filter = MessagesFilter.all;

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
          if (_activeTab == 0)
            MessagesSidebarFilterBar(
              filter: _filter,
              onFilterChanged: (f) => setState(() => _filter = f),
              lang: widget.lang,
            ),
          Expanded(
            child: _activeTab == 0
                ? MessagesSidebarConversations(
                    searchQuery: _searchQuery,
                    filter: _filter,
                  )
                : MessagesSidebarFriends(searchQuery: _searchQuery),
          ),
        ],
      ),
    );
  }
}
