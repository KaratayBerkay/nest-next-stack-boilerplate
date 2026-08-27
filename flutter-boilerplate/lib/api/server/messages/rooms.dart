import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final roomsServerProvider =
    Provider((ref) => RoomsServer(ref.read(dioProvider)));

/// Hits the backend-native `/api/rooms` directly — like the rest of this
/// vertical's REST-shaped mobile calls, this bypasses the Next.js BFF.
class RoomsServer {
  final Dio _dio;

  RoomsServer(this._dio);

  Future<List<String>> call() async {
    final response = await _dio.get<List<dynamic>>('/api/rooms');
    return response.data!
        .map((r) => (r as Map<String, dynamic>)['slug'] as String)
        .toList();
  }
}
