import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Session {
  final String id;
  final String device;
  final String location;
  final String lastActive;
  final String? userAgent;

  const Session({
    required this.id,
    required this.device,
    required this.location,
    required this.lastActive,
    this.userAgent,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      id: json['sessionId'] as String? ?? json['id'] as String,
      device: json['deviceId'] as String? ?? json['device'] as String,
      location: json['ip'] as String? ?? json['location'] as String? ?? '',
      lastActive:
          json['issuedAt'] as String? ?? json['lastActive'] as String? ?? '',
      userAgent: json['userAgent'] as String?,
    );
  }
}

final sessionsListServerProvider =
    Provider((ref) => SessionsListServer(ref.read(dioProvider)));

const _query = '''
  query MySessions {
    mySessions {
      sessionId
      deviceId
      ip
      userAgent
      issuedAt
    }
  }
''';

class SessionsListServer {
  final Dio _dio;

  SessionsListServer(this._dio);

  Future<List<Session>> call() async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {'query': _query},
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to fetch sessions',
      );
    }
    final list = (body['data'] as Map<String, dynamic>)['mySessions'] as List;
    return list
        .map((e) => Session.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
