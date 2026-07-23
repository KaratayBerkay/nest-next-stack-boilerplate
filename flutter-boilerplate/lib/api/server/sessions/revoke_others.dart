import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final revokeOthersServerProvider = Provider((ref) => RevokeOthersServer(ref.read(dioProvider)));

class RevokeOthersServer {
  final Dio _dio;

  RevokeOthersServer(this._dio);

  Future<void> call() async {
    await _dio.post<dynamic>(Urls.sessionsRevokeOthers);
  }
}
