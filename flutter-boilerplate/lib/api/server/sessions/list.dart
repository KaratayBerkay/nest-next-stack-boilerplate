import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

class Session {
  final String id;
  final String device;
  final String location;
  final String lastActive;
  final bool isCurrent;

  const Session({
    required this.id,
    required this.device,
    required this.location,
    required this.lastActive,
    this.isCurrent = false,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      id: json['id'] as String,
      device: json['device'] as String,
      location: json['location'] as String,
      lastActive: json['lastActive'] as String,
      isCurrent: json['isCurrent'] as bool? ?? false,
    );
  }
}

final sessionsListServerProvider =
    Provider((ref) => SessionsListServer(ref.read(dioProvider)));

class SessionsListServer {
  final Dio _dio;

  SessionsListServer(this._dio);

  Future<List<Session>> call() async {
    final response = await _dio.get<dynamic>(Urls.sessionsList);
    final list = response.data as List<dynamic>;
    return list
        .map((e) => Session.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
