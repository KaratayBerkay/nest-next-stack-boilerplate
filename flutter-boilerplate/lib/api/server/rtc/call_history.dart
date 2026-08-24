import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../types/rtc/call_history_entry.dart';

final callHistoryServerProvider =
    Provider((ref) => CallHistoryServer(ref.read(dioProvider)));

class CallHistoryServer {
  final Dio _dio;

  CallHistoryServer(this._dio);

  Future<CallHistoryPage> call({String? before, int take = 30}) async {
    final response = await _dio.get<dynamic>(
      Urls.rtcCalls,
      queryParameters: {
        if (before != null) 'before': before,
        'take': take,
      },
    );
    return CallHistoryPage.fromJson(response.data as Map<String, dynamic>);
  }
}
