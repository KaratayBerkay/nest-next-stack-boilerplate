import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/chat.dart';
import 'chat_room_base_view.dart';

class MediumPageView extends ChatRoomBaseView {
  const MediumPageView({super.key, super.lang, super.initialRoom, super.showPageInfo});

  @override
  ConsumerState<ChatRoomBaseView> createState() => _MediumPageViewState();
}

class _MediumPageViewState extends ChatRoomBaseViewState {
  @override
  List<String> get vipRooms => ChatConstants.vipRooms;

  @override
  bool get useNativeControls => true;
}
