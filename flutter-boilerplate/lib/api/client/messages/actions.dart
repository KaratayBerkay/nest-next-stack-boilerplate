import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message_attachment.dart';
import '../../server/messages/delete_message.dart';
import '../../server/messages/send_message.dart';
import '../../server/messages/upload_attachment.dart';

final messageActionsProvider = Provider((ref) => MessageActions(ref));

class MessageActions {
  final Ref _ref;

  MessageActions(this._ref);

  Future<void> sendMessage(
    String conversationId,
    String content, {
    MessageAttachment? attachment,
  }) async {
    final server = _ref.read(sendMessageServerProvider);
    await server.call(
      conversationId,
      content,
      attachment == null ? const [] : [attachment],
    );
  }

  Future<MessageAttachment> uploadAttachment(
    String filePath,
    String fileName,
  ) async {
    final server = _ref.read(uploadAttachmentServerProvider);
    return server.call(filePath, fileName);
  }

  Future<void> deleteMessageForMe(String messageId) async {
    final server = _ref.read(deleteMessageServerProvider);
    await server.forMe(messageId);
  }

  Future<void> deleteMessageForEveryone(String messageId) async {
    final server = _ref.read(deleteMessageServerProvider);
    await server.forEveryone(messageId);
  }
}
