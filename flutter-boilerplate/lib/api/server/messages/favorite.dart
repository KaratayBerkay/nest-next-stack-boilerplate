import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final favoriteConversationServerProvider =
    Provider((ref) => FavoriteConversationServer(ref.read(dioProvider)));

// `messaging.controller.ts`'s `POST /api/messages/favorite` / `/unfavorite`
// (`@Controller('api')`), body `{ peerId }` — one-directional, own account
// only, matches the web BFF's `favorite.ts`/`unfavorite.ts` routes' backend
// call exactly.
class FavoriteConversationServer {
  final Dio _dio;

  FavoriteConversationServer(this._dio);

  Future<void> setFavorite(String peerId, bool favorite) async {
    await _dio.post<dynamic>(
      favorite ? '/api/messages/favorite' : '/api/messages/unfavorite',
      data: {'peerId': peerId},
    );
  }
}
