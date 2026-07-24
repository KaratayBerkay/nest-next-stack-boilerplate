import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final stripeServerProvider =
    Provider((ref) => StripeServer(ref.read(dioProvider)));

class StripeServer {
  final Dio _dio;

  StripeServer(this._dio);

  Future<Map<String, dynamic>> createSetupIntent() async {
    final response = await _dio.post<dynamic>(Urls.billingCreateSetupIntent);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> subscribe(String priceId) async {
    final response = await _dio
        .post<dynamic>(Urls.billingSubscribe, data: {'priceId': priceId});
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> retrieveSubscription() async {
    final response = await _dio.get<dynamic>(Urls.billingSubscription);
    return response.data as Map<String, dynamic>;
  }
}
