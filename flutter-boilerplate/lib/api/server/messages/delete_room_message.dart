import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final deleteRoomMessageServerProvider =
    Provider((ref) => DeleteRoomMessageServer(ref.read(dioProvider)));

/// Room-message counterpart of [DeleteMessageServer] (CROSS-024). Rooms are
/// REST-only on the backend (`/api/rooms/...`), so these are plain POSTs,
/// not GraphQL mutations.
class DeleteRoomMessageServer {
  final Dio _dio;

  DeleteRoomMessageServer(this._dio);

  Future<void> forMe(String room, String messageId) => _dio.post<dynamic>(
        '/api/rooms/$room/messages/$messageId/delete-for-me',
      );

  Future<void> forEveryone(String room, String messageId) => _dio.post<dynamic>(
        '/api/rooms/$room/messages/$messageId/delete-for-everyone',
      );
}
