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

  Future<void> deleteMessageForMe(String messageId) async {
    final server = _ref.read(deleteMessageServerProvider);
    await server.forMe(messageId);
  }

  Future<void> deleteMessageForEveryone(String messageId) async {
    final server = _ref.read(deleteMessageServerProvider);
    await server.forEveryone(messageId);
  }

  Future<void> setFavorite(String peerId, bool favorite) async {
    final server = _ref.read(favoriteConversationServerProvider);
    await server.setFavorite(peerId, favorite);
    _ref.invalidate(conversationsProvider);
  }
}
