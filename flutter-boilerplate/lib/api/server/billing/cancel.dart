import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final billingCancelServerProvider =
    Provider((ref) => BillingCancelServer(ref.read(dioProvider)));

class BillingCancelServer {
  final Dio _dio;

  BillingCancelServer(this._dio);

  Future<void> call() async {
    await _dio.post<dynamic>(Urls.billingCancel);
  }
}
