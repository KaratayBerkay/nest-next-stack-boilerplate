import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/users/search.dart';
import '../../components/ui/avatar/avatar.dart';

class UsersPageContent extends ConsumerStatefulWidget {
  final String lang;

  const UsersPageContent({super.key, required this.lang});

  @override
  ConsumerState<UsersPageContent> createState() => _UsersPageContentState();
}

class _UsersPageContentState extends ConsumerState<UsersPageContent> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final resultsAsync = ref.watch(searchUsersProvider(_query));

    return Scaffold(
      appBar: AppBar(title: const Text('Users')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search users...',
                prefixIcon: const Icon(Icons.search),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                isDense: true,
              ),
              onSubmitted: (v) => setState(() => _query = v),
            ),
          ),
          Expanded(
            child: resultsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (users) => ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: users.length,
                itemBuilder: (_, i) => ListTile(
                  leading: Avatar(name: users[i].name),
                  title: Text(users[i].name),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
