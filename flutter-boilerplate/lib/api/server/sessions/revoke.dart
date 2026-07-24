import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final revokeSessionServerProvider =
    Provider((ref) => RevokeSessionServer(ref.read(dioProvider)));

class RevokeSessionServer {
  final Dio _dio;

  RevokeSessionServer(this._dio);

  Future<void> call(String sessionId) async {
    await _dio.post<dynamic>('${Urls.sessionsRevoke}/$sessionId');
  }
}
