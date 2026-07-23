import 'package:flutter_riverpod/flutter_riverpod.dart';

final queryParamsProvider = Provider<Map<String, String>>((ref) => {});

Map<String, String> useClientSearchParams(WidgetRef ref) {
  return ref.watch(queryParamsProvider);
}
