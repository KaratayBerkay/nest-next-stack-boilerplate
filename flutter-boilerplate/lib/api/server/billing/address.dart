import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final billingAddressServerProvider =
    Provider((ref) => BillingAddressServer(ref.read(dioProvider)));

class BillingAddressServer {
  final Dio _dio;

  BillingAddressServer(this._dio);

  Future<Map<String, dynamic>> get() async {
    final response = await _dio.get<dynamic>(Urls.billingAddress);
    return response.data as Map<String, dynamic>;
  }

  Future<void> update(Map<String, dynamic> address) async {
    await _dio.put<dynamic>(Urls.billingAddress, data: address);
  }
}
