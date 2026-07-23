import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';
import '../../../types/messages/conversation.dart';

final conversationsServerProvider = Provider((ref) => ConversationsServer(ref.read(dioProvider)));

class ConversationsServer {
  final Dio _dio;

  ConversationsServer(this._dio);

  Future<List<Conversation>> call() async {
    final response = await _dio.get<dynamic>(Urls.conversations);
    final list = response.data as List<dynamic>;
    return list.map((e) => Conversation.fromJson(e as Map<String, dynamic>)).toList();
  }
}
