import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/friends/query.dart';
import '../../../api/client/users/search.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/empty/empty.dart';
import '../../../constants/theme.dart';

class UsersListPageContent extends ConsumerStatefulWidget {
  final String lang;

  const UsersListPageContent({super.key, required this.lang});

  @override
  ConsumerState<UsersListPageContent> createState() => _UsersListPageContentState();
}

class _UsersListPageContentState extends ConsumerState<UsersListPageContent> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final friendsAsync = ref.watch(friendsListProvider);
    final searchAsync = ref.watch(searchUsersProvider(_query));

    return Scaffold(
      appBar: AppBar(title: const Text('Users')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search users...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                isDense: true,
              ),
              onSubmitted: (v) => setState(() => _query = v),
            ),
          ),
          Expanded(
            child: _query.isEmpty
                ? friendsAsync.when(
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Center(child: Text('Error: $e')),
                    data: (friends) {
                      if (friends.isEmpty) {
                        return const EmptyWidget(
                          title: 'No friends yet',
                          icon: Icons.people_outline,
                        );
                      }
                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: friends.length,
                        itemBuilder: (_, i) => ListTile(
                          leading: Avatar(name: friends[i].name),
                          title: Text(friends[i].name),
                          subtitle: Row(
                            children: [
                              Container(
                                width: 8, height: 8,
                                decoration: BoxDecoration(
                                  color: friends[i].isOnline ? colors.success : colors.fgMuted,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(friends[i].isOnline ? 'Online' : 'Offline',
                                  style: TextStyle(color: colors.fgMuted, fontSize: 12),),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => context.go('/v1/${widget.lang}/users/${friends[i].id}'),
                        ),
                      );
                    },
                  )
                : searchAsync.when(
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Center(child: Text('Error: $e')),
                    data: (users) => ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: users.length,
                      itemBuilder: (_, i) => ListTile(
                        leading: Avatar(name: users[i].name),
                        title: Text(users[i].name),
                        onTap: () => context.go('/v1/${widget.lang}/users/${users[i].id}'),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
