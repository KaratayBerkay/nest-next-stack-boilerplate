import 'package:flutter/material.dart';

import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import 'chat_room_sub_components.dart';

class ChatRoomSidebar extends StatefulWidget {
  final bool useNativeControls;
  final bool sidebarOpen;
  final List<String> rooms;
  final String room;
  final Map<String, int> roomCounts;
  final List<String> vipRooms;
  final List<Map<String, String?>> roomMembers;
  final String currentUserId;
  final bool showSelfCrown;
  final ValueChanged<bool> onSetSidebarOpen;
  final ValueChanged<String> onSelectRoom;

  const ChatRoomSidebar({
    super.key,
    this.useNativeControls = false,
    this.sidebarOpen = false,
    required this.rooms,
    required this.room,
    this.roomCounts = const {},
    this.vipRooms = const [],
    this.roomMembers = const [],
    required this.currentUserId,
    this.showSelfCrown = false,
    required this.onSetSidebarOpen,
    required this.onSelectRoom,
  });

  @override
  State<ChatRoomSidebar> createState() => _ChatRoomSidebarState();
}

class _ChatRoomSidebarState extends State<ChatRoomSidebar>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      width: 220,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Rooms',
                style: TextStyle(
                  color: colors.fgMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
              const Spacer(),
              if (widget.sidebarOpen)
                SidebarCloseButton(
                  useNativeControls: widget.useNativeControls,
                  onClick: () => widget.onSetSidebarOpen(false),
                ),
            ],
          ),
          const SizedBox(height: 12),
          TabBar(
            controller: _tabController,
            tabs: [
              const Tab(text: 'Rooms'),
              Tab(
                text:
                    'Online (${widget.roomCounts[widget.room] ?? 0})',
              ),
            ],
            labelColor: colors.brand,
            unselectedLabelColor: colors.fgMuted,
            indicatorColor: colors.brand,
          ),
          const SizedBox(height: 8),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                ListView(
                  children: widget.rooms.map((r) {
                    final count = widget.roomCounts[r] ?? 0;
                    final isVip = widget.vipRooms.contains(r);
                    return RoomButton(
                      useNativeControls: widget.useNativeControls,
                      room: r,
                      isActive: widget.room == r,
                      count: count,
                      isVip: isVip,
                      onSelect: () => widget.onSelectRoom(r),
                    );
                  }).toList(),
                ),
                widget.roomMembers.isEmpty
                    ? Center(
                        child: Text(
                          'No one is here',
                          style: TextStyle(color: colors.fgMuted, fontSize: 12),
                        ),
                      )
                    : ListView(
                        children: widget.roomMembers.map((m) {
                          final name = m['name'] ?? 'Unknown';
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                                vertical: 4, horizontal: 8,),
                            child: Row(
                              children: [
                                Avatar(name: name, radius: 16),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    name,
                                    style: TextStyle(
                                      color: colors.fg,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (widget.showSelfCrown &&
                                    m['id'] == widget.currentUserId)
                                  Icon(
                                    Icons.workspace_premium,
                                    size: 14,
                                    color: colors.brand,
                                  ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
