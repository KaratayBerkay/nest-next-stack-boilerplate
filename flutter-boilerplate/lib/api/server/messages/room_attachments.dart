import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/gallery_attachment.dart';

final roomAttachmentsServerProvider = Provider(
  (ref) => RoomAttachmentsServer(ref.read(dioProvider)),
);

/// Hits the backend-native `GET /api/rooms/:roomId/attachments` directly,
/// matching this vertical's other REST-shaped mobile calls.
class RoomAttachmentsServer {
  final Dio _dio;

  RoomAttachmentsServer(this._dio);

  Future<GalleryAttachmentsPage> call(
    String roomId, {
    String? before,
    int take = 30,
  }) async {
    final response = await _dio.get<dynamic>(
      '/api/rooms/$roomId/attachments',
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
