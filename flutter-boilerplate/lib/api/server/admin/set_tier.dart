import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final adminSetTierServerProvider =
    Provider((ref) => AdminSetTierServer(ref.read(dioProvider)));

class AdminSetTierServer {
  final Dio _dio;

  AdminSetTierServer(this._dio);

  Future<void> call(String userId, String tier) async {
    await _dio.post<dynamic>(
      Urls.adminSetTier,
      data: {
        'userId': userId,
        'tier': tier,
      },
    );
  }
}
