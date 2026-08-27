import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/gallery_attachment.dart';

final conversationAttachmentsServerProvider = Provider(
  (ref) => ConversationAttachmentsServer(ref.read(dioProvider)),
);

/// Hits the backend-native `GET /api/conversations/:userId/attachments`
/// directly, matching this vertical's other REST-shaped mobile calls.
class ConversationAttachmentsServer {
  final Dio _dio;

  ConversationAttachmentsServer(this._dio);

  Future<GalleryAttachmentsPage> call(
    String peerId, {
    String? before,
    int take = 30,
  }) async {
    final response = await _dio.get<dynamic>(
      '/api/conversations/$peerId/attachments',
      queryParameters: {
        if (before != null) 'before': before,
        'take': take,
      },
    );
    return GalleryAttachmentsPage.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
