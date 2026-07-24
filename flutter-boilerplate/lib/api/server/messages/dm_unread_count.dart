import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dmUnreadCountServerProvider =
    Provider((ref) => DmUnreadCountServer(ref.read(dioProvider)));

class DmUnreadCountServer {
  final Dio _dio;

  DmUnreadCountServer(this._dio);

  Future<int> call() async {
    final response = await _dio.get<dynamic>('/api/messages/unread-count');
    return response.data['count'] as int;
  }
}
