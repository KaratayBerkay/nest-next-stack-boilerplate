import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final meRawServerProvider = Provider((ref) => MeRawServer(ref.read(dioProvider)));

class MeRawServer {
  final Dio _dio;

  MeRawServer(this._dio);

  Future<AuthMeResult> call() async {
    final response = await _dio.get<dynamic>(Urls.me);
    final data = response.data as Map<String, dynamic>;
    return AuthMeResult(
      authed: data['authed'] as bool? ?? false,
      session: data['session'] as String?,
    );
  }
}

class AuthMeResult {
  final bool authed;
  final String? session;

  const AuthMeResult({required this.authed, this.session});
}
