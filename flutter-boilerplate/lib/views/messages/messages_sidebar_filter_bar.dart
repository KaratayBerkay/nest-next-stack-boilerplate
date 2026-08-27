import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

enum MessagesFilter { all, unread, favorites }

class MessagesSidebarFilterBar extends StatelessWidget {
  final MessagesFilter filter;
  final ValueChanged<MessagesFilter> onFilterChanged;
  final String lang;

  const MessagesSidebarFilterBar({
    super.key,
    required this.filter,
    required this.onFilterChanged,
    required this.lang,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        children: [
          _Pill(
            label: t.messagesFilterAll,
            selected: filter == MessagesFilter.all,
            onTap: () => onFilterChanged(MessagesFilter.all),
          ),
          const SizedBox(width: 6),
          _Pill(
            label: t.messagesFilterUnread,
            selected: filter == MessagesFilter.unread,
            onTap: () => onFilterChanged(MessagesFilter.unread),
          ),
          const SizedBox(width: 6),
          _Pill(
            label: t.messagesFilterFavorites,
            selected: filter == MessagesFilter.favorites,
            onTap: () => onFilterChanged(MessagesFilter.favorites),
          ),
          const SizedBox(width: 6),
          // Groups are chat rooms — a structurally separate feature/screen
          // from 1:1 conversations (no unified "conversations + rooms" list
          // exists backend-side), so this pill navigates there instead of
          // switching an in-place filter like the other three.
          _Pill(
            label: t.messagesFilterGroups,
            selected: false,
            onTap: () => context.push('/v1/$lang/chat-room'),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _Pill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? colors.brand : colors.surfaceAlt,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: selected ? colors.surface : colors.fgMuted,
          ),
        ),
      ),
    );
  }
}
