import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/auth/user.dart';

final meServerProvider = Provider((ref) => MeServer(ref.read(dioProvider)));

class MeServer {
  final Dio _dio;

  MeServer(this._dio);

  Future<AuthenticatedUser> call() async {
    final response = await _dio.get<dynamic>(Urls.me);
    return AuthenticatedUser.fromJson(
      response.data['user'] as Map<String, dynamic>,
    );
  }
}
