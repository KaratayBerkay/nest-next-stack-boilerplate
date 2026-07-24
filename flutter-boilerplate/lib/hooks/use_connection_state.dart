import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

enum AppConnectionState { online, connecting, unstable, locked }

final connectionStateProvider =
    StateProvider<AppConnectionState>((ref) => AppConnectionState.online);
