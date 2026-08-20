import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message_attachment.dart';

final roomMessagesServerProvider =
    Provider((ref) => RoomMessagesServer(ref.read(dioProvider)));

class RoomMessagesPage {
  final List<RoomMessage> messages;
  final bool hasMore;

  const RoomMessagesPage({required this.messages, required this.hasMore});
}

class RoomMessagesServer {
  final Dio _dio;

  RoomMessagesServer(this._dio);

  Future<RoomMessagesPage> call(
    String room, {
    String? before,
    int take = 30,
  }) async {
    final response = await _dio.get<dynamic>(
      '/api/rooms/$room/messages',
      queryParameters: {
        if (before != null) 'before': before,
        'take': take,
      },
    );
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final messages = (data['messages'] as List? ?? const [])
          .map((m) => RoomMessage.fromJson(m as Map<String, dynamic>))
          .toList();
      return RoomMessagesPage(
        messages: messages,
        hasMore: data['hasMore'] as bool? ?? false,
      );
    }
    throw Exception('Failed to fetch room messages');
  }
}

class RoomMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String avatar;
  final String body;
  final List<MessageAttachment> attachments;
  final String createdAt;

  const RoomMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.avatar,
    required this.body,
    this.attachments = const [],
    required this.createdAt,
  });

  factory RoomMessage.fromJson(Map<String, dynamic> json) {
    return RoomMessage(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String,
      avatar: json['avatar'] as String,
      // Mirrors the same guard on the DM side (ConversationMessagesServer.
      // _mapMessage): message-body.util.ts's resolveBody() falls through to
      // the raw, bodyless row on a full decrypt failure, so this can be
      // absent even though RoomMessage itself has no delete/tombstone path.
      body: json['body'] as String? ?? '',
      attachments: (json['attachments'] as List<dynamic>? ?? const [])
          .map((e) => MessageAttachment.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: json['createdAt'] as String,
    );
  }
}
