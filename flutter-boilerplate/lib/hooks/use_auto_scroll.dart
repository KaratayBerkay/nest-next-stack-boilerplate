import 'package:flutter_riverpod/flutter_riverpod.dart';

final useAutoScrollProvider = Provider((ref) => AutoScrollState());

class AutoScrollState {
  bool isAtBottom = true;

  bool get shouldAutoScroll => isAtBottom;
}
