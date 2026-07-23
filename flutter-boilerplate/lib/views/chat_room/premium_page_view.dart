import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/chat.dart';
import 'chat_room_base_view.dart';

class PremiumPageView extends ChatRoomBaseView {
  const PremiumPageView({super.key, super.lang, super.initialRoom, super.showPageInfo});

  @override
  ConsumerState<ChatRoomBaseView> createState() => _PremiumPageViewState();
}

class _PremiumPageViewState extends ChatRoomBaseViewState {
  @override
  List<String> get vipRooms => ChatConstants.vipRooms;

  @override
  bool get useNativeControls => true;

  @override
  bool get showSelfCrown => true;
}
