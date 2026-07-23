import 'dart:async';
import 'package:go_router/go_router.dart';

class DeepLinkService {
  final GoRouter router;
  final StreamController<String> _linkController = StreamController<String>.broadcast();

  DeepLinkService({required this.router});

  Stream<String> get linkStream => _linkController.stream;

  void handleDeepLink(String uri) {
    _linkController.add(uri);
    router.go(uri);
  }

  void dispose() {
    _linkController.close();
  }
}
