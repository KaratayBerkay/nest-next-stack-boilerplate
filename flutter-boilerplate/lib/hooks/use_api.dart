import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

final dioClientProvider = Provider<Dio>((ref) {
  return ref.watch(dioProvider);
});
