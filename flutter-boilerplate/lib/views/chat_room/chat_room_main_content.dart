import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../types/messages/message.dart';
import 'chat_room_message_list.dart';
import 'chat_room_sub_components.dart';

class ChatRoomMainContent extends StatelessWidget {
  final bool useNativeControls;
  final String room;
  final Map<String, int> roomCounts;
  final String connectionState;
  final List<ChatMessage> messages;
  final String userId;
  final Set<String> onlineUserIds;
  final bool msgsLoading;
  final bool msgsError;
  final TextEditingController messageController;
  final ScrollController scrollController;
  final bool isAtBottom;
  final ValueChanged<bool> onSetSidebarOpen;
  final VoidCallback onSend;
  final VoidCallback onScrollToBottom;

  const ChatRoomMainContent({
    super.key,
    this.useNativeControls = false,
    required this.room,
    this.roomCounts = const {},
    this.connectionState = 'online',
    this.messages = const [],
    required this.userId,
    this.onlineUserIds = const {},
    this.msgsLoading = false,
    this.msgsError = false,
    required this.messageController,
    required this.scrollController,
    this.isAtBottom = true,
    required this.onSetSidebarOpen,
    required this.onSend,
    required this.onScrollToBottom,
  });

  String get _placeholder {
    switch (connectionState) {
      case 'online':
        return 'Message #$room';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Disconnected';
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (connectionState == 'locked') {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline, size: 32, color: colors.fgMuted),
            const SizedBox(height: 8),
            Text('Tab locked', style: TextStyle(color: colors.fgMuted)),
          ],
        ),
      );
    }

    if (connectionState == 'unstable') {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.wifi_off, size: 32, color: colors.warning),
            const SizedBox(height: 8),
            Text(
              'Disconnected. Reconnecting...',
              style: TextStyle(color: colors.fgMuted),
            ),
          ],
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: colors.border)),
            ),
            child: Row(
              children: [
                HamburgerButton(
                  useNativeControls: useNativeControls,
                  room: room,
                  countLabel: _placeholder,
                  onClick: () => onSetSidebarOpen(true),
                ),
              ],
            ),
          ),
          Expanded(
            child: ChatRoomMessageList(
              messages: messages,
              userId: userId,
              onlineUserIds: onlineUserIds,
              msgsLoading: msgsLoading,
              msgsError: msgsError,
            ),
          ),
          if (!isAtBottom && messages.isNotEmpty)
            Positioned(
              bottom: 80,
              right: 16,
              child: FloatingActionButton.small(
                onPressed: onScrollToBottom,
                child: const Icon(Icons.arrow_downward),
              ),
            ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: colors.border)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: MessageInput(
                    useNativeControls: useNativeControls,
                    controller: messageController,
                    placeholder: _placeholder,
                    disabled: connectionState != 'online',
                  ),
                ),
                const SizedBox(width: 8),
                SendButton(
                  useNativeControls: useNativeControls,
                  onClick: onSend,
                  disabled: connectionState != 'online' ||
                      messageController.text.trim().isEmpty,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
