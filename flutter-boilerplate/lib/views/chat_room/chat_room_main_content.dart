import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/insert_emoji.dart';

import '../../components/ui/scroll_to_bottom_button/scroll_to_bottom_button.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message.dart';
import '../../types/messages/message_attachment.dart';
import 'chat_room_message_list.dart';
import 'chat_room_sub_components.dart';

class ChatRoomMainContent extends StatelessWidget {
  final String room;
  final Map<String, int> roomCounts;
  final String connectionState;
  final List<ChatMessage> messages;
  final bool hasMore;
  final bool isLoadingMore;
  final VoidCallback? onLoadMore;
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
  // CROSS-024: quoted-reply target + per-message actions.
  final ChatMessage? replyTarget;
  final VoidCallback? onCancelReply;
  final ValueChanged<ChatMessage>? onReply;
  final ValueChanged<ChatMessage>? onDeleteForMe;
  final ValueChanged<ChatMessage>? onDeleteForEveryone;

  const ChatRoomMainContent({
    super.key,
    required this.room,
    this.roomCounts = const {},
    this.connectionState = 'online',
    this.messages = const [],
    this.hasMore = false,
    this.isLoadingMore = false,
    this.onLoadMore,
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
    this.replyTarget,
    this.onCancelReply,
    this.onReply,
    this.onDeleteForMe,
    this.onDeleteForEveryone,
  });

  String _replySnippet(AppLocalizations t, ChatMessage target) {
    if (target.deletedAt != null) return t.messagesDeletedMessage;
    if (target.content.isNotEmpty) return target.content;
    if (target.attachments.isNotEmpty) return t.messagesAttachmentLabel;
    return '';
  }

  void _insertEmoji(Emoji emoji) {
    insertEmojiAtCursor(messageController, emoji);
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
                      room: room,
                      // "{count} online", like the web header — this used to
                      // show the composer's input placeholder here.
                      countLabel: t.chatRoomCountOnline(roomCounts[room] ?? 0),
                      onClick: () => onSetSidebarOpen(true),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ChatRoomMessageList(
                  messages: messages,
                  hasMore: hasMore,
                  isLoadingMore: isLoadingMore,
                  onLoadMore: onLoadMore,
                  userId: userId,
                  onlineUserIds: onlineUserIds,
                  msgsLoading: msgsLoading,
                  msgsError: msgsError,
                  scrollController: scrollController,
                  onReply: onReply,
                  onDeleteForMe: onDeleteForMe,
                  onDeleteForEveryone: onDeleteForEveryone,
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
                          onEmojiSelected: (_, emoji) => _insertEmoji(emoji),
                        ),
                      ),
                    if (replyTarget != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          children: [
                            Icon(Icons.reply, size: 14, color: colors.brand),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    t.messagesReplyingTo(
                                      replyTarget!.senderId == userId
                                          ? t.messagesYou
                                          : replyTarget!.senderName,
                                    ),
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: colors.brand,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  Text(
                                    _replySnippet(t, replyTarget!),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: colors.fgMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, size: 16),
                              tooltip: t.chatRoomCancelReply,
                              visualDensity: VisualDensity.compact,
                              onPressed: onCancelReply,
                            ),
                          ],
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
                            controller: messageController,
                            placeholder: _placeholder(t),
                            disabled: connectionState != 'online',
                            onSubmitted: (_) => onSend(),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SendButton(
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
