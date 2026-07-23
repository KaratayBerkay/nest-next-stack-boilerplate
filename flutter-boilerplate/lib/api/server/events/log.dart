import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final eventsLogServerProvider = Provider((ref) => EventsLogServer(ref.read(dioProvider)));

class EventsLogServer {
  final Dio _dio;

  EventsLogServer(this._dio);

  Future<void> call(String event, Map<String, dynamic>? properties) async {
    await _dio.post<dynamic>(Urls.events, data: {
      'event': event,
      'properties': properties ?? {},
    });
  }
}
