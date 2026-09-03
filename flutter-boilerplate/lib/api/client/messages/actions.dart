import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message_attachment.dart';
import '../../server/messages/delete_message.dart';
import '../../server/messages/favorite.dart';
import '../../server/messages/send_message.dart';
import '../../server/messages/upload_attachment.dart';
import 'query.dart';

final messageActionsProvider = Provider((ref) => MessageActions(ref));

class MessageActions {
  final Ref _ref;

  MessageActions(this._ref);

  Future<void> sendMessage(
    String conversationId,
    String content, {
    MessageAttachment? attachment,
    String? replyToId,
  }) async {
    final server = _ref.read(sendMessageServerProvider);
    await server.call(
      conversationId,
      content,
      attachment == null ? const [] : [attachment],
      replyToId: replyToId,
    );
  }

  Future<MessageAttachment> uploadAttachment(
    String filePath,
    String fileName, {
    String? scopeKind,
    String? scopeId,
  }) async {
    final server = _ref.read(uploadAttachmentServerProvider);
    return server.call(
      filePath,
      fileName,
      scopeKind: scopeKind,
      scopeId: scopeId,
    );
  }

  // conversationId is the DM peer id — conversationMessagesProvider's family
  // key — so the caller can pass message.conversationId straight through.
  // Without this refresh the message stayed visible on screen, unchanged,
  // until the app was relaunched: the server-side delete succeeded but
  // nothing ever told this screen's StateNotifier its cached list was stale.
  Future<void> deleteMessageForMe(
    String conversationId,
    String messageId,
  ) async {
    final server = _ref.read(deleteMessageServerProvider);
    await server.forMe(messageId);
    await _ref
        .read(conversationMessagesProvider(conversationId).notifier)
        .refresh();
  }

  Future<void> deleteMessageForEveryone(
    String conversationId,
    String messageId,
  ) async {
    final server = _ref.read(deleteMessageServerProvider);
    await server.forEveryone(messageId);
    await _ref
        .read(conversationMessagesProvider(conversationId).notifier)
        .refresh();
  }

  Future<void> setFavorite(String peerId, bool favorite) async {
    final server = _ref.read(favoriteConversationServerProvider);
    await server.setFavorite(peerId, favorite);
    _ref.invalidate(conversationsProvider);
  }
}
