import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';

import '../../components/ui/scroll_to_bottom_button/scroll_to_bottom_button.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message.dart';
import '../../types/messages/message_attachment.dart';
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
  final bool attaching;
  final bool emojiOpen;
  final MessageAttachment? pendingAttachment;
  final ValueChanged<bool> onSetSidebarOpen;
  final VoidCallback onSend;
  final VoidCallback? onAttachFile;
  final VoidCallback? onRemoveAttachment;
  final VoidCallback? onToggleEmoji;

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
    this.attaching = false,
    this.emojiOpen = false,
    this.pendingAttachment,
    required this.onSetSidebarOpen,
    required this.onSend,
    this.onAttachFile,
    this.onRemoveAttachment,
    this.onToggleEmoji,
  });

  void _insertEmojiAtCursor(Emoji emoji) {
    final text = messageController.text;
    final selection = messageController.selection;
    final start = selection.isValid ? selection.start : text.length;
    final end = selection.isValid ? selection.end : text.length;
    final updated = text.replaceRange(start, end, emoji.emoji);
    messageController.value = TextEditingValue(
      text: updated,
      selection: TextSelection.collapsed(offset: start + emoji.emoji.length),
    );
    onToggleEmoji?.call();
  }

  String _placeholder(AppLocalizations t) {
    switch (connectionState) {
      case 'online':
        return t.chatRoomMessagePlaceholder(room);
      case 'connecting':
        return t.chatRoomConnecting;
      default:
        return t.chatRoomDisconnected;
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    if (connectionState == 'locked') {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline, size: 32, color: colors.fgMuted),
            const SizedBox(height: 8),
            Text(t.chatRoomTabLocked, style: TextStyle(color: colors.fgMuted)),
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
              t.chatRoomReconnecting,
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
      child: Stack(
        children: [
          Column(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: colors.border)),
                ),
                child: Row(
                  children: [
                    HamburgerButton(
                      useNativeControls: useNativeControls,
                      room: room,
                      countLabel: _placeholder(t),
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
                  scrollController: scrollController,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  border: Border(top: BorderSide(color: colors.border)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (emojiOpen)
                      SizedBox(
                        height: 260,
                        child: EmojiPicker(
                          onEmojiSelected: (_, emoji) =>
                              _insertEmojiAtCursor(emoji),
                        ),
                      ),
                    if (pendingAttachment != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.attach_file,
                              size: 14,
                              color: colors.fgMuted,
                            ),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                pendingAttachment!.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style:
                                    TextStyle(fontSize: 12, color: colors.fg),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, size: 16),
                              visualDensity: VisualDensity.compact,
                              onPressed: onRemoveAttachment,
                            ),
                          ],
                        ),
                      ),
                    Row(
                      children: [
                        ComposerIconButton(
                          icon: Icons.emoji_emotions_outlined,
                          tooltip: t.chatRoomOpenEmojiPicker,
                          disabled: connectionState != 'online' || attaching,
                          onPressed: onToggleEmoji,
                        ),
                        ComposerIconButton(
                          icon: Icons.attach_file,
                          tooltip: t.chatRoomAttachFile,
                          disabled: connectionState != 'online' || emojiOpen,
                          loading: attaching,
                          onPressed: onAttachFile,
                        ),
                        Expanded(
                          child: MessageInput(
                            useNativeControls: useNativeControls,
                            controller: messageController,
                            placeholder: _placeholder(t),
                            disabled: connectionState != 'online',
                            onSubmitted: (_) => onSend(),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SendButton(
                          useNativeControls: useNativeControls,
                          onClick: onSend,
                          disabled: connectionState != 'online' ||
                              (messageController.text.trim().isEmpty &&
                                  pendingAttachment == null) ||
                              attaching,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (!isAtBottom && messages.isNotEmpty)
            Positioned(
              bottom: 80,
              right: 16,
              child: ScrollToBottomButton(
                scrollController: scrollController,
              ),
            ),
        ],
      ),
    );
  }
}
