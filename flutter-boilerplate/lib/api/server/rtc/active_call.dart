import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/rtc/active_call_snapshot.dart';

final activeCallServerProvider =
    Provider((ref) => ActiveCallServer(ref.read(dioProvider)));

class ActiveCallServer {
  final Dio _dio;

  ActiveCallServer(this._dio);

  Future<ActiveCallSnapshot?> call() async {
    final response = await _dio.get<dynamic>(Urls.rtcActiveCall);
    final body = response.data as Map<String, dynamic>;
    final call = body['call'] as Map<String, dynamic>?;
    return call != null ? ActiveCallSnapshot.fromJson(call) : null;
  }
}
