import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final roomMessagesServerProvider =
    Provider((ref) => RoomMessagesServer(ref.read(dioProvider)));

class RoomMessagesServer {
  final Dio _dio;

  RoomMessagesServer(this._dio);

  Future<List<RoomMessage>> call(String room) async {
    final response = await _dio.get<dynamic>(
      '${Urls.roomMessages}/$room/messages',
    );
    final data = response.data;
    if (data is List) {
      return data
          .map((m) => RoomMessage.fromJson(m as Map<String, dynamic>))
          .toList();
    }
    if (data is Map<String, dynamic>) {
      final messages = data['messages'] as List?;
      if (messages != null) {
        return messages
            .map((m) => RoomMessage.fromJson(m as Map<String, dynamic>))
            .toList();
      }
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
  final String createdAt;

  const RoomMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.avatar,
    required this.body,
    required this.createdAt,
  });

  factory RoomMessage.fromJson(Map<String, dynamic> json) {
    return RoomMessage(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String,
      avatar: json['avatar'] as String,
      body: json['body'] as String,
      createdAt: json['createdAt'] as String,
    );
  }
}
